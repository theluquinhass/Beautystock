-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  plan text default 'free'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- RLS Policies
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles for select
using ( auth.uid() = id );

create policy "Users can update their own profile"
on public.profiles for update
using ( auth.uid() = id );

-- Function to handle new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, plan)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'free'
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: Backfill existing users (Run this manually if needed)
-- insert into public.profiles (id, plan)
-- select id, 'free' from auth.users
-- where id not in (select id from public.profiles);
