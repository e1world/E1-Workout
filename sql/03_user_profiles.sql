-- Run this in Supabase SQL editor

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  code text,          -- e.g. "E1", "B1"
  avatar_gender text default 'm' check (avatar_gender in ('m', 'f')),
  goal text check (goal in ('strength', 'hypertrophy', 'endurance', 'general')),
  experience text check (experience in ('beginner', 'intermediate', 'advanced')),
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "users can manage own profile"
  on user_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
