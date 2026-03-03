alter table public.enrollments
add column if not exists payment_method text,
add column if not exists payment_account_number text,
add column if not exists payment_sender_name text,
add column if not exists payment_reference text,
add column if not exists receipt_path text,
add column if not exists payment_uploaded_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enrollments_payment_method_check'
  ) then
    alter table public.enrollments
      add constraint enrollments_payment_method_check
      check (
        payment_method is null
        or payment_method in ('cbe', 'telebirr')
      );
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('enrollment-receipts', 'enrollment-receipts', false)
on conflict (id) do nothing;

drop policy if exists "Enrollment receipts read own" on storage.objects;
create policy "Enrollment receipts read own" on storage.objects
for select
using (
  bucket_id = 'enrollment-receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Enrollment receipts upload own" on storage.objects;
create policy "Enrollment receipts upload own" on storage.objects
for insert
with check (
  bucket_id = 'enrollment-receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Enrollment receipts update own" on storage.objects;
create policy "Enrollment receipts update own" on storage.objects
for update
using (
  bucket_id = 'enrollment-receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'enrollment-receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Enrollment receipts delete own" on storage.objects;
create policy "Enrollment receipts delete own" on storage.objects
for delete
using (
  bucket_id = 'enrollment-receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Enrollment receipts admin read" on storage.objects;
create policy "Enrollment receipts admin read" on storage.objects
for select
using (
  bucket_id = 'enrollment-receipts'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, 'student')) = 'admin'
  )
);
