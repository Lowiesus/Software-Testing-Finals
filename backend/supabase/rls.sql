-- Run this in the Supabase SQL Editor after schema.sql / migrations.sql
--
-- This app talks to Postgres only through the Express backend using the
-- SUPABASE_SERVICE_ROLE_KEY. The service role bypasses RLS, so backend
-- queries keep working.
--
-- Enabling RLS blocks the public (anon/publishable) API from reading tables
-- such as users.password and admins.password directly from the browser.

alter table public.users enable row level security;
alter table public.admins enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reblogs enable row level security;
alter table public.tags enable row level security;

-- Optional but recommended: enforce RLS for table owners too.
alter table public.users force row level security;
alter table public.admins force row level security;
alter table public.posts force row level security;
alter table public.comments force row level security;
alter table public.likes force row level security;
alter table public.bookmarks force row level security;
alter table public.reblogs force row level security;
alter table public.tags force row level security;

-- No policies are created on purpose.
-- Without policies, anon/authenticated clients cannot read or write these tables.
-- Only the backend service role (server-side) can access the data.
