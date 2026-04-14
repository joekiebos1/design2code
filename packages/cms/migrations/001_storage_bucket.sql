-- Studio Media storage bucket
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
--
-- Creates a public storage bucket for studio inspiration media
-- (benchmark screenshots, jio design images/videos) and lab block
-- page thumbnails / preview assets.

-- 1. Create the bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-media',
  'studio-media',
  true,
  31457280,  -- 30 MB
  array[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'image/avif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
on conflict (id) do nothing;

-- 2. Allow public reads (anyone with the publishable key)
create policy "Public read studio-media"
  on storage.objects for select
  using (bucket_id = 'studio-media');

-- 3. Allow uploads via secret key (server-side API routes only)
create policy "Service upload studio-media"
  on storage.objects for insert
  with check (bucket_id = 'studio-media');

-- 4. Allow updates/deletes via secret key
create policy "Service update studio-media"
  on storage.objects for update
  using (bucket_id = 'studio-media');

create policy "Service delete studio-media"
  on storage.objects for delete
  using (bucket_id = 'studio-media');
