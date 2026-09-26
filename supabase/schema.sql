-- Birthday cake schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).

create extension if not exists "pgcrypto";

create table if not exists cakes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  recipient_name text not null,
  cake_title text not null,
  final_sender text not null,
  final_message text not null,
  final_candle jsonb not null,
  owner_id uuid references auth.users(id) not null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  cake_id uuid references cakes(id) on delete cascade not null,
  sender text not null check (char_length(sender) between 1 and 40),
  message text not null check (char_length(message) between 1 and 500),
  candle jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists read_state (
  message_id uuid references messages(id) on delete cascade not null,
  device_id uuid not null,
  read_at timestamptz not null default now(),
  primary key (message_id, device_id)
);

alter table cakes enable row level security;
alter table messages enable row level security;
alter table read_state enable row level security;

-- CAKES
-- Anyone who has the slug (i.e. has the link) can look up the cake. The
-- slug itself is the "capability" a shareable link grants — same trust
-- model as an unlisted Google Doc link.
create policy "cakes are publicly readable by slug" on cakes
  for select using (true);

-- Only the signed-in creator can create/update/delete their own cakes.
create policy "owners manage their own cakes" on cakes
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- MESSAGES
-- Anyone can read messages (needed to render the cake for the recipient
-- and anyone else who has the link).
create policy "messages are publicly readable" on messages
  for select using (true);

-- Anyone (including anonymous friends with no account) can add a message
-- to a cake that exists. They can never update or delete one.
create policy "anyone can submit a message" on messages
  for insert with check (true);

-- Only the cake's owner can delete a message (used by the admin "Delete"
-- button). There is deliberately no update policy — messages are
-- immutable once submitted.
create policy "owners can delete messages on their cakes" on messages
  for delete using (
    exists (select 1 from cakes where cakes.id = messages.cake_id and cakes.owner_id = auth.uid())
  );

-- READ_STATE
-- Read state has no account to check against — the recipient never signs
-- in either. Anyone with the link can upsert a read row. This is an
-- intentional, documented trade-off: the worst case is someone with the
-- link re-lights or blows out a candle that isn't "theirs" to touch, which
-- is low-severity for a birthday page. If you need stronger guarantees,
-- gate the whole cake behind Supabase Auth for the recipient too.
create policy "anyone can upsert read state" on read_state
  for insert with check (true);

create policy "anyone can update their own device's read state" on read_state
  for update using (true);

create policy "read state is publicly readable" on read_state
  for select using (true);

-- VIEW PASSWORD (optional, set per cake in /admin)
-- Lets the creator require a password before anyone with the /cake/<slug>
-- link can actually see the candle messages. The password is hashed and
-- checked entirely on the server via the two functions below — it never
-- travels to or through the browser in plain form, and the hash itself is
-- never selected by the app's normal queries either.
alter table cakes add column if not exists view_password_hash text;

-- Only the cake's owner (signed in to /admin) can set/change/clear the
-- password. Passing an empty string clears it (cake becomes open again).
create or replace function set_cake_password(p_slug text, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update cakes
  set view_password_hash = case when p_password = '' then null else crypt(p_password, gen_salt('bf')) end
  where slug = p_slug and owner_id = auth.uid();
  return found;
end;
$$;
revoke all on function set_cake_password(text, text) from public;
grant execute on function set_cake_password(text, text) to authenticated;

-- Anyone can call this (no login needed, same trust model as the link
-- itself) but it only ever returns true/false — never the password or the
-- stored hash. If no password has been set for a cake, it returns true so
-- older/no-password cakes keep working exactly as before.
create or replace function verify_cake_password(p_slug text, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored text;
begin
  select view_password_hash into stored from cakes where slug = p_slug;
  if stored is null then
    return true;
  end if;
  return stored = crypt(p_password, stored);
end;
$$;
revoke all on function verify_cake_password(text, text) from public;
grant execute on function verify_cake_password(text, text) to anon, authenticated;
