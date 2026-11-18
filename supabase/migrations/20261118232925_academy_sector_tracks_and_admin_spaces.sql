-- Sector-based learning tracks and administrator-only authoring.
create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists sector_id uuid references public.sectors(id) on delete set null;
alter table public.courses add column if not exists sector_id uuid references public.sectors(id) on delete set null;
create index if not exists courses_sector_id_idx on public.courses(sector_id);
create index if not exists profiles_sector_id_idx on public.profiles(sector_id);

create or replace function private.is_academy_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='admin' and p.status='active');
$$;
revoke all on function private.is_academy_admin() from public, anon;
grant execute on function private.is_academy_admin() to authenticated;

create or replace function private.can_access_course(target_course_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.courses c join public.profiles p on p.id=(select auth.uid())
    where c.id=target_course_id and p.status='active'
      and (p.role='admin' or (c.status='published' and (c.sector_id is null or c.sector_id=p.sector_id)))
  );
$$;
revoke all on function private.can_access_course(uuid) from public, anon;
grant execute on function private.can_access_course(uuid) to authenticated;

create or replace function public.protect_academy_profile()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_academy_admin() and (
    new.role is distinct from old.role or new.status is distinct from old.status or new.email is distinct from old.email
  ) then
    raise exception 'Only Academy administrators may change role, status or email.';
  end if;
  return new;
end;
$$;
revoke all on function public.protect_academy_profile() from public, anon, authenticated;
drop trigger if exists protect_academy_profile on public.profiles;
create trigger protect_academy_profile before update on public.profiles for each row execute function public.protect_academy_profile();

alter table public.sectors enable row level security;
drop policy if exists sectors_read_active on public.sectors;
create policy sectors_read_active on public.sectors for select to authenticated using (active or (select private.is_academy_admin()));
drop policy if exists sectors_admin_manage on public.sectors;
create policy sectors_admin_manage on public.sectors for all to authenticated using ((select private.is_academy_admin())) with check ((select private.is_academy_admin()));
grant select, insert, update, delete on public.sectors to authenticated;

drop policy if exists courses_staff_manage on public.courses;
create policy courses_admin_manage on public.courses for all to authenticated using ((select private.is_academy_admin())) with check ((select private.is_academy_admin()));
drop policy if exists courses_read on public.courses;
create policy courses_read on public.courses for select to authenticated using ((select private.can_access_course(id)));

drop policy if exists modules_staff_manage on public.course_modules;
create policy modules_admin_manage on public.course_modules for all to authenticated using ((select private.is_academy_admin())) with check ((select private.is_academy_admin()));
drop policy if exists modules_read on public.course_modules;
create policy modules_read on public.course_modules for select to authenticated using ((select private.can_access_course(course_id)));

drop policy if exists lessons_staff_manage on public.lessons;
create policy lessons_admin_manage on public.lessons for all to authenticated using ((select private.is_academy_admin())) with check ((select private.is_academy_admin()));
drop policy if exists lessons_read on public.lessons;
create policy lessons_read on public.lessons for select to authenticated using (
  exists (select 1 from public.course_modules m where m.id=lessons.module_id and (select private.can_access_course(m.course_id)))
);

drop policy if exists academy_media_admin_read on storage.objects;
create policy academy_media_admin_read on storage.objects for select to authenticated using (
  bucket_id='academy-course-media' and (
    (select private.is_academy_admin()) or exists (
      select 1 from public.courses c where c.id::text=(storage.foldername(name))[1] and (select private.can_access_course(c.id))
    )
  )
);
drop policy if exists academy_media_admin_insert on storage.objects;
create policy academy_media_admin_insert on storage.objects for insert to authenticated with check (bucket_id='academy-course-media' and (select private.is_academy_admin()));
drop policy if exists academy_media_admin_update on storage.objects;
create policy academy_media_admin_update on storage.objects for update to authenticated using (bucket_id='academy-course-media' and (select private.is_academy_admin())) with check (bucket_id='academy-course-media' and (select private.is_academy_admin()));
drop policy if exists academy_media_admin_delete on storage.objects;
create policy academy_media_admin_delete on storage.objects for delete to authenticated using (bucket_id='academy-course-media' and (select private.is_academy_admin()));

grant select on public.courses, public.course_modules, public.lessons to authenticated;
grant insert, update, delete on public.courses, public.course_modules, public.lessons to authenticated;
