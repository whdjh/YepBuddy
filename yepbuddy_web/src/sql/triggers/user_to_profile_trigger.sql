create function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
    if new.raw_app_meta_data is not null then
        if new.raw_app_meta_data ? 'provider'
            and new.raw_app_meta_data ->> 'provider' = 'email' then

            insert into public.profiles (
                profile_id,
                name,
                role,
                description,
                qualifications
            )
            values (
                new.id,
                'Anonymous',
                'member',
                '아직 자기소개가 없습니다.',
                '정보 없음'
            );

        end if;
    end if;

    return new;
end;
$$;

create trigger user_to_profile_trigger
after insert on auth.users
for each row execute function public.handle_new_user();
