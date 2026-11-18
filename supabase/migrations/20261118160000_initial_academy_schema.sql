create schema if not exists private;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text, full_name text not null default '', avatar_url text,
 role text not null default 'student' check(role in ('admin','instructor','student')),
 status text not null default 'active' check(status in ('invited','active','suspended')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.courses (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
 description text not null default '', cover_url text,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 created_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.course_modules (
 id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
 title text not null, description text not null default '', position integer not null default 0, created_at timestamptz not null default now()
);
create table public.lessons (
 id uuid primary key default gen_random_uuid(), module_id uuid not null references public.course_modules(id) on delete cascade,
 title text not null, description text not null default '',
 content_type text not null default 'video' check(content_type in ('video','article','resource','live')),
 content text not null default '', media_path text, duration_seconds integer not null default 0 check(duration_seconds>=0),
 is_preview boolean not null default false, position integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.enrollments (
 id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'active' check(status in ('active','completed','cancelled')),
 assigned_by uuid references public.profiles(id) on delete set null, enrolled_at timestamptz not null default now(),
 completed_at timestamptz, unique(course_id,user_id)
);
create table public.lesson_progress (
 id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 completed boolean not null default false, watched_seconds integer not null default 0 check(watched_seconds>=0),
 last_position_seconds integer not null default 0 check(last_position_seconds>=0),
 updated_at timestamptz not null default now(), unique(lesson_id,user_id)
);
create table public.assessments (
 id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
 module_id uuid references public.course_modules(id) on delete cascade, title text not null,
 description text not null default '', passing_score numeric(5,2) not null default 70 check(passing_score between 0 and 100),
 max_attempts integer check(max_attempts is null or max_attempts>0), is_published boolean not null default false,
 created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now()
);
create table public.assessment_questions (
 id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.assessments(id) on delete cascade,
 prompt text not null, question_type text not null default 'multiple_choice' check(question_type in ('multiple_choice','true_false','short_answer')),
 options jsonb not null default '[]'::jsonb, correct_answer jsonb not null default 'null'::jsonb,
 points numeric(7,2) not null default 1 check(points>0), position integer not null default 0
);
create table public.assessment_attempts (
 id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.assessments(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade, answers jsonb not null default '{}'::jsonb,
 score numeric(5,2), passed boolean, started_at timestamptz not null default now(), submitted_at timestamptz
);
create table public.certificates (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade, certificate_code text not null unique,
 issued_at timestamptz not null default now(), unique(user_id,course_id)
);
create index courses_status_idx on public.courses(status);
create index modules_course_position_idx on public.course_modules(course_id,position);
create index lessons_module_position_idx on public.lessons(module_id,position);
create index enrollments_user_status_idx on public.enrollments(user_id,status);
create index progress_user_idx on public.lesson_progress(user_id);
create index attempts_user_assessment_idx on public.assessment_attempts(user_id,assessment_id);

create or replace function private.current_academy_role() returns text language sql stable security definer set search_path=''
as $$ select p.role from public.profiles p where p.id=(select auth.uid()) and p.status='active' limit 1 $$;
create or replace function private.is_academy_staff() returns boolean language sql stable security definer set search_path=''
as $$ select coalesce(private.current_academy_role() in ('admin','instructor'),false) $$;
create or replace function private.is_academy_admin() returns boolean language sql stable security definer set search_path=''
as $$ select coalesce(private.current_academy_role()='admin',false) $$;
grant usage on schema private to authenticated;
grant execute on function private.current_academy_role(),private.is_academy_staff(),private.is_academy_admin() to authenticated;

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path=''
as $$ begin new.updated_at=now(); return new; end $$;
create or replace function public.handle_academy_user_created() returns trigger language plpgsql security definer set search_path=''
as $$ begin
 insert into public.profiles(id,email,full_name,role,status) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),'student','active')
 on conflict(id) do update set email=excluded.email,
 full_name=case when public.profiles.full_name='' then excluded.full_name else public.profiles.full_name end;
 return new;
end $$;
create trigger on_academy_auth_user_created after insert on auth.users for each row execute function public.handle_academy_user_created();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger courses_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();
create trigger progress_updated_at before update on public.lesson_progress for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.certificates enable row level security;

grant select on public.profiles to authenticated;
grant update(full_name,avatar_url) on public.profiles to authenticated;
grant select,insert,update,delete on public.courses,public.course_modules,public.lessons,public.assessments,public.assessment_questions to authenticated;
grant select on public.enrollments,public.certificates to authenticated;
grant select,insert,update on public.lesson_progress,public.assessment_attempts to authenticated;

create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or (select private.is_academy_staff()));
create policy profiles_update_self on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));

create policy courses_read on public.courses for select to authenticated using(status='published' or (select private.is_academy_staff()) or exists(select 1 from public.enrollments e where e.course_id=id and e.user_id=(select auth.uid()) and e.status in ('active','completed')));
create policy courses_staff_manage on public.courses for all to authenticated using((select private.is_academy_staff())) with check((select private.is_academy_staff()));
create policy modules_read on public.course_modules for select to authenticated using(exists(select 1 from public.courses c where c.id=course_id and (c.status='published' or (select private.is_academy_staff()) or exists(select 1 from public.enrollments e where e.course_id=c.id and e.user_id=(select auth.uid()) and e.status in ('active','completed')))));
create policy modules_staff_manage on public.course_modules for all to authenticated using((select private.is_academy_staff())) with check((select private.is_academy_staff()));
create policy lessons_read on public.lessons for select to authenticated using(is_preview or (select private.is_academy_staff()) or exists(select 1 from public.course_modules m join public.enrollments e on e.course_id=m.course_id where m.id=module_id and e.user_id=(select auth.uid()) and e.status in ('active','completed')));
create policy lessons_staff_manage on public.lessons for all to authenticated using((select private.is_academy_staff())) with check((select private.is_academy_staff()));
create policy enrollments_read on public.enrollments for select to authenticated using(user_id=(select auth.uid()) or (select private.is_academy_staff()));
create policy enrollments_staff_manage on public.enrollments for all to authenticated using((select private.is_academy_staff())) with check((select private.is_academy_staff()));
create policy progress_read on public.lesson_progress for select to authenticated using(user_id=(select auth.uid()) or (select private.is_academy_staff()));
create policy progress_insert_own on public.lesson_progress for insert to authenticated with check(user_id=(select auth.uid()));
create policy progress_update_own on public.lesson_progress for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy assessments_read on public.assessments for select to authenticated using((select private.is_academy_staff()) or exists(select 1 from public.enrollments e where e.course_id=course_id and e.user_id=(select auth.uid()) and e.status in ('active','completed')));
create policy assessments_staff_manage on public.assessments for all to authenticated using((select private.is_academy_staff())) with check((select private.is_academy_staff()));
create policy questions_read on public.assessment_questions for select to authenticated using((select private.is_academy_staff()) or exists(select 1 from public.assessments a join public.enrollments e on e.course_id=a.course_id where a.id=assessment_id and a.is_published and e.user_id=(select auth.uid()) and e.status in ('active','completed')));
create policy questions_staff_manage on public.assessment_questions for all to authenticated using((select private.is_academy_staff())) with check((select private.is_academy_staff()));
create policy attempts_read on public.assessment_attempts for select to authenticated using(user_id=(select auth.uid()) or (select private.is_academy_staff()));
create policy attempts_insert_own on public.assessment_attempts for insert to authenticated with check(user_id=(select auth.uid()));
create policy attempts_update_own on public.assessment_attempts for update to authenticated using(user_id=(select auth.uid()) and submitted_at is null) with check(user_id=(select auth.uid()));
create policy certificates_read on public.certificates for select to authenticated using(user_id=(select auth.uid()) or (select private.is_academy_staff()));
create policy certificates_issue_staff on public.certificates for insert to authenticated with check((select private.is_academy_staff()));

-- Explicit Data API grants: new projects no longer expose public tables automatically.
grant select,insert,update,delete on public.profiles,public.courses,public.course_modules,public.lessons,public.enrollments,public.lesson_progress,public.assessments,public.assessment_questions,public.assessment_attempts,public.certificates to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('academy-avatars','academy-avatars',true,5242880,array['image/png','image/jpeg','image/webp']),
('academy-course-media','academy-course-media',false,524288000,array['video/mp4','video/webm','application/pdf','image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;
create policy academy_avatar_read on storage.objects for select to anon,authenticated using(bucket_id='academy-avatars');
create policy academy_avatar_upload on storage.objects for insert to authenticated with check(bucket_id='academy-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy academy_avatar_update on storage.objects for update to authenticated using(bucket_id='academy-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='academy-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy academy_avatar_delete on storage.objects for delete to authenticated using(bucket_id='academy-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy academy_media_read on storage.objects for select to authenticated using(bucket_id='academy-course-media' and ((select private.is_academy_staff()) or exists(select 1 from public.enrollments e where e.course_id::text=(storage.foldername(name))[1] and e.user_id=(select auth.uid()) and e.status in ('active','completed'))));
create policy academy_media_insert on storage.objects for insert to authenticated with check(bucket_id='academy-course-media' and (select private.is_academy_staff()));
create policy academy_media_update on storage.objects for update to authenticated using(bucket_id='academy-course-media' and (select private.is_academy_staff())) with check(bucket_id='academy-course-media' and (select private.is_academy_staff()));
create policy academy_media_delete on storage.objects for delete to authenticated using(bucket_id='academy-course-media' and (select private.is_academy_staff()));
