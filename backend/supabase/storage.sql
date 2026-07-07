-- Run in Supabase SQL Editor after schema.sql
-- Creates a public uploads bucket for post images and profile pictures

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

create policy "Public read access for uploads"
on storage.objects for select
using (bucket_id = 'uploads');

create policy "Service role can upload"
on storage.objects for insert
with check (bucket_id = 'uploads');

create policy "Service role can update uploads"
on storage.objects for update
using (bucket_id = 'uploads');

create policy "Service role can delete uploads"
on storage.objects for delete
using (bucket_id = 'uploads');
