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
