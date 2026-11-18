-- Harden RPC exposure and prepare private answer-key storage.
revoke all on function public.handle_academy_user_created() from public, anon, authenticated;

create index if not exists assessment_attempts_assessment_id_idx on public.assessment_attempts(assessment_id);
create index if not exists assessment_questions_assessment_id_idx on public.assessment_questions(assessment_id);
create index if not exists assessments_course_id_idx on public.assessments(course_id);
create index if not exists assessments_module_id_idx on public.assessments(module_id);
create index if not exists assessments_created_by_idx on public.assessments(created_by);
create index if not exists certificates_course_id_idx on public.certificates(course_id);
create index if not exists courses_created_by_idx on public.courses(created_by);
create index if not exists enrollments_assigned_by_idx on public.enrollments(assigned_by);

create table private.assessment_answer_keys (
 question_id uuid primary key references public.assessment_questions(id) on delete cascade,
 correct_answer jsonb not null,
 updated_at timestamptz not null default now()
);
alter table private.assessment_answer_keys enable row level security;
revoke all on private.assessment_answer_keys from anon, authenticated, public;

alter table public.assessment_questions drop column correct_answer;

create or replace function public.activate_academy_invited_user()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 if new.email_confirmed_at is not null and (old.email_confirmed_at is null) then
   update public.profiles set status='active', email=new.email
   where id=new.id and status='invited';
 end if;
 return new;
end;
$$;
revoke all on function public.activate_academy_invited_user() from public, anon, authenticated;
create trigger on_academy_user_confirmed
after update of email_confirmed_at on auth.users
for each row execute function public.activate_academy_invited_user();
