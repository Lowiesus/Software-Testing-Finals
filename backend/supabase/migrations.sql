-- Run in Supabase SQL Editor

alter table users add column if not exists bio text;

create table if not exists reblogs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_reblogs_user_id on reblogs(user_id);
create index if not exists idx_reblogs_post_id on reblogs(post_id);
