-- Readly schema for project readly (hrlpidapontbnrvmrqzw, eu-central-1).
-- Matches the applied migration init_readly_schema.
-- Parents see a child only when they own the profile or have a parent_child_links row.
-- Frontend uses the anon key only. Never ship service_role to the browser.

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  display_name text not null,
  age integer,
  locale text default 'ru',
  interests text[] default '{}',
  theme text,
  demo boolean default false,
  profile_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_child_links (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_id, child_id)
);

create table if not exists public.progress_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists progress_events_child_created_idx
  on public.progress_events (child_id, created_at desc);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  title text not null,
  body text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists stories_child_created_idx
  on public.stories (child_id, created_at desc);

alter table public.child_profiles enable row level security;
alter table public.parent_child_links enable row level security;
alter table public.progress_events enable row level security;
alter table public.stories enable row level security;

drop policy if exists child_profiles_select on public.child_profiles;
create policy child_profiles_select on public.child_profiles
  for select to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.parent_child_links l
      where l.child_id = child_profiles.id and l.parent_id = auth.uid()
    )
  );

drop policy if exists child_profiles_insert on public.child_profiles;
create policy child_profiles_insert on public.child_profiles
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists child_profiles_update on public.child_profiles;
create policy child_profiles_update on public.child_profiles
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists parent_child_links_select on public.parent_child_links;
create policy parent_child_links_select on public.parent_child_links
  for select to authenticated
  using (parent_id = auth.uid());

drop policy if exists parent_child_links_insert on public.parent_child_links;
create policy parent_child_links_insert on public.parent_child_links
  for insert to authenticated
  with check (parent_id = auth.uid());

drop policy if exists parent_child_links_delete on public.parent_child_links;
create policy parent_child_links_delete on public.parent_child_links
  for delete to authenticated
  using (parent_id = auth.uid());

drop policy if exists progress_events_select on public.progress_events;
create policy progress_events_select on public.progress_events
  for select to authenticated
  using (
    exists (
      select 1
      from public.child_profiles c
      left join public.parent_child_links l on l.child_id = c.id
      where c.id = progress_events.child_id
        and (c.owner_id = auth.uid() or l.parent_id = auth.uid())
    )
  );

drop policy if exists progress_events_insert on public.progress_events;
create policy progress_events_insert on public.progress_events
  for insert to authenticated
  with check (
    exists (
      select 1 from public.child_profiles c
      where c.id = progress_events.child_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists stories_select on public.stories;
create policy stories_select on public.stories
  for select to authenticated
  using (
    exists (
      select 1
      from public.child_profiles c
      left join public.parent_child_links l on l.child_id = c.id
      where c.id = stories.child_id
        and (c.owner_id = auth.uid() or l.parent_id = auth.uid())
    )
  );

drop policy if exists stories_insert on public.stories;
create policy stories_insert on public.stories
  for insert to authenticated
  with check (
    exists (
      select 1 from public.child_profiles c
      where c.id = stories.child_id and c.owner_id = auth.uid()
    )
  );

grant all on table public.child_profiles to anon, authenticated, service_role;
grant all on table public.parent_child_links to anon, authenticated, service_role;
grant all on table public.progress_events to anon, authenticated, service_role;
grant all on table public.stories to anon, authenticated, service_role;
