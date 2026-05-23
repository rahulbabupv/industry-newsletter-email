-- Run this in your Supabase project: Dashboard → SQL Editor → New Query

-- Newsletters saved by each user
create table public.newsletters (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  topic       text not null,
  from_date   date not null,
  to_date     date not null,
  data        jsonb not null,           -- full newsletter JSON (title, articles, outlook, etc.)
  created_at  timestamptz not null default now()
);

-- Each user can only see their own newsletters
alter table public.newsletters enable row level security;

create policy "Users can read their own newsletters"
  on public.newsletters for select
  using (auth.uid() = user_id);

create policy "Users can insert their own newsletters"
  on public.newsletters for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own newsletters"
  on public.newsletters for delete
  using (auth.uid() = user_id);

-- Index for fast history queries per user
create index newsletters_user_id_created_at_idx
  on public.newsletters (user_id, created_at desc);
