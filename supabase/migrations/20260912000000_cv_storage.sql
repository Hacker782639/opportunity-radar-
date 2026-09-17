alter table public.profiles
  add column if not exists cv_file_name text,
  add column if not exists cv_storage_path text,
  add column if not exists cv_uploaded_at timestamptz;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'cv-resumes',
  'cv-resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cv_resumes_select_own" on storage.objects;
create policy "cv_resumes_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'cv-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'cv'
);

drop policy if exists "cv_resumes_insert_own" on storage.objects;
create policy "cv_resumes_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'cv-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'cv'
);

drop policy if exists "cv_resumes_update_own" on storage.objects;
create policy "cv_resumes_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'cv-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'cv'
)
with check (
  bucket_id = 'cv-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'cv'
);

drop policy if exists "cv_resumes_delete_own" on storage.objects;
create policy "cv_resumes_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'cv-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'cv'
);
