-- Run this script in the Supabase SQL Editor before starting the backend.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text unique not null,
  password text,
  role text not null default 'user',
  status text not null default 'not_verified',
  firebase_uid text unique,
  profile_picture text,
  bio text,
  is_google_user boolean not null default false,
  banned_at timestamptz,
  ban_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text unique not null,
  password text not null,
  full_name text default '',
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login timestamptz
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  caption text not null,
  image text not null,
  category text not null,
  post_type text not null default 'Standard Post',
  author_id uuid not null references users(id) on delete cascade,
  author_username text not null default 'user',
  author_profile_picture text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  author_username text not null default 'user',
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists reblogs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  post_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_author_id on posts(author_id);
create index if not exists idx_posts_category on posts(category);
create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_likes_post_id on likes(post_id);
create index if not exists idx_bookmarks_user_id on bookmarks(user_id);
create index if not exists idx_reblogs_user_id on reblogs(user_id);
create index if not exists idx_reblogs_post_id on reblogs(post_id);
