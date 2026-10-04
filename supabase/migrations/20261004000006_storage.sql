-- =====================================================================
-- Storage buckets & policies
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp','image/gif']),
  ('logos', 'logos', true, 2097152, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('exports', 'exports', false, 52428800, null),
  ('assets', 'assets', true, 10485760, array['image/png','image/jpeg','image/webp','image/svg+xml','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- avatars: thư mục đầu = user id
create policy "avatars public read" on storage.objects for select to anon, authenticated using (bucket_id = 'avatars');
create policy "avatars owner insert" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars owner update" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars owner delete" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- logos: thư mục đầu = user id
create policy "logos public read" on storage.objects for select to anon, authenticated using (bucket_id = 'logos');
create policy "logos owner insert" on storage.objects for insert to authenticated with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos owner update" on storage.objects for update to authenticated using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos owner delete" on storage.objects for delete to authenticated using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

-- exports: private, chỉ chủ sở hữu đọc; server (service role) ghi
create policy "exports owner read" on storage.objects for select to authenticated using (bucket_id = 'exports' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "exports owner delete" on storage.objects for delete to authenticated using (bucket_id = 'exports' and (storage.foldername(name))[1] = auth.uid()::text);

-- assets: admin quản lý, public đọc
create policy "assets public read" on storage.objects for select to anon, authenticated using (bucket_id = 'assets');
create policy "assets admin write" on storage.objects for insert to authenticated with check (bucket_id = 'assets' and public.is_admin());
create policy "assets admin update" on storage.objects for update to authenticated using (bucket_id = 'assets' and public.is_admin());
create policy "assets admin delete" on storage.objects for delete to authenticated using (bucket_id = 'assets' and public.is_admin());
