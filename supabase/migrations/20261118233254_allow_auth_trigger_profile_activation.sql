create or replace function public.protect_academy_profile()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_academy_admin() then
    if new.role is distinct from old.role then
      raise exception 'Only Academy administrators may change account roles.';
    end if;
    -- Permit trusted nested auth triggers such as email confirmation.
    if pg_trigger_depth() <= 1 and (
      new.status is distinct from old.status
      or new.email is distinct from old.email
    ) then
      raise exception 'Only Academy administrators may change account status or email.';
    end if;
  end if;
  return new;
end;
$$;
