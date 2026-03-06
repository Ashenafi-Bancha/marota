create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, 'student')) in ('admin', 'super_admin', 'master_admin', 'owner')
  );
$$;

create or replace function public.is_master_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, 'student')) in ('master_admin', 'owner')
  );
$$;

drop policy if exists "Profiles admin read all" on public.profiles;
create policy "Profiles admin read all" on public.profiles
for select
using (public.is_admin_user());

drop policy if exists "Profiles admin update all" on public.profiles;
create policy "Profiles admin update all" on public.profiles
for update
using (public.is_master_admin_user())
with check (public.is_master_admin_user());
