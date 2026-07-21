-- ============================================================
-- LIFT — Workout Tracker Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Programs
create table if not exists programs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  description text,
  is_active   boolean default false,
  created_at  timestamptz default now()
);

-- Program days (e.g. "Push Day", "Pull Day")
create table if not exists program_days (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid references programs(id) on delete cascade not null,
  day_order   int not null,
  name        text not null
);

-- Exercises within a program day
create table if not exists program_exercises (
  id               uuid primary key default gen_random_uuid(),
  program_day_id   uuid references program_days(id) on delete cascade not null,
  exercise_order   int not null,
  name             text not null,
  sets             int not null default 3,
  rep_min          int not null default 8,   -- e.g. 8 in "8–12"
  rep_max          int not null default 12,  -- e.g. 12 in "8–12"
  current_weight   numeric not null default 0,
  weight_unit      text not null default 'lbs',
  weight_increment numeric not null default 5, -- how much to add on progression
  notes            text
);

-- Workout sessions (one per day trained)
create table if not exists workout_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  program_day_id  uuid references program_days(id),
  day_name        text,        -- denormalised snapshot
  started_at      timestamptz default now(),
  completed_at    timestamptz,
  notes           text
);

-- Individual set logs
create table if not exists set_logs (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid references workout_sessions(id) on delete cascade not null,
  program_exercise_id uuid references program_exercises(id) on delete set null,
  exercise_name       text not null,  -- denormalised
  set_number          int not null,
  target_reps         int,
  actual_reps         int,
  weight              numeric,
  weight_unit         text default 'lbs',
  completed           boolean default false,
  logged_at           timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table programs           enable row level security;
alter table program_days       enable row level security;
alter table program_exercises  enable row level security;
alter table workout_sessions   enable row level security;
alter table set_logs           enable row level security;

-- programs: users own their own rows
create policy "programs: owner access"
  on programs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- program_days: accessible if the parent program belongs to the user
create policy "program_days: owner access"
  on program_days for all
  using (
    exists (
      select 1 from programs
      where programs.id = program_days.program_id
        and programs.user_id = auth.uid()
    )
  );

-- program_exercises: accessible if the parent day's program belongs to the user
create policy "program_exercises: owner access"
  on program_exercises for all
  using (
    exists (
      select 1 from program_days
      join programs on programs.id = program_days.program_id
      where program_days.id = program_exercises.program_day_id
        and programs.user_id = auth.uid()
    )
  );

-- workout_sessions: users own their own rows
create policy "workout_sessions: owner access"
  on workout_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- set_logs: accessible if the parent session belongs to the user
create policy "set_logs: owner access"
  on set_logs for all
  using (
    exists (
      select 1 from workout_sessions
      where workout_sessions.id = set_logs.session_id
        and workout_sessions.user_id = auth.uid()
    )
  );

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists idx_programs_user_id          on programs(user_id);
create index if not exists idx_program_days_program_id   on program_days(program_id);
create index if not exists idx_program_ex_day_id         on program_exercises(program_day_id);
create index if not exists idx_sessions_user_id          on workout_sessions(user_id);
create index if not exists idx_sessions_started_at       on workout_sessions(started_at desc);
create index if not exists idx_set_logs_session_id       on set_logs(session_id);
create index if not exists idx_set_logs_exercise_id      on set_logs(program_exercise_id);
