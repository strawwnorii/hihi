-- Run this ONCE in the Supabase SQL Editor if your database already exists
-- (you ran schema.sql before). Safe to re-run.

-- 1) Themes + unlock countdown
alter table cakes add column if not exists theme text not null default 'plum';
alter table cakes drop constraint if exists cakes_theme_check;
alter table cakes add constraint cakes_theme_check
  check (theme in ('plum', 'espresso', 'blush', 'midnight'));
alter table cakes add column if not exists unlock_at timestamptz;

-- 2) Longer messages (500 -> 2000 characters)
alter table messages drop constraint if exists messages_message_check;
alter table messages add constraint messages_message_check
  check (char_length(message) between 1 and 2000);
