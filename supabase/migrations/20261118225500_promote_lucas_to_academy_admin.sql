-- Promote the confirmed Academy account to administrator.
-- This is scoped to the exact email explicitly confirmed by the account owner.
do $$
declare
  target_user_id uuid;
begin
  select id
    into target_user_id
    from auth.users
   where lower(email) = lower('lucasv96.lv@gmail.com')
   limit 1;

  if target_user_id is null then
    raise exception 'Academy account lucasv96.lv@gmail.com does not exist in auth.users';
  end if;

  update public.profiles
     set role = 'admin',
         status = 'active',
         email = 'lucasv96.lv@gmail.com',
         updated_at = now()
   where id = target_user_id;

  if not found then
    raise exception 'Profile row for lucasv96.lv@gmail.com was not found';
  end if;

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                             || jsonb_build_object('academy_role', 'admin'),
         updated_at = now()
   where id = target_user_id;
end
$$;
