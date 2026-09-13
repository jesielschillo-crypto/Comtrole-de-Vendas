create table if not exists public.app_state_client_v1 (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state_client_v1 enable row level security;

drop policy if exists "app_state_client_v1_read" on public.app_state_client_v1;
create policy "app_state_client_v1_read"
  on public.app_state_client_v1 for select
  to anon, authenticated
  using (true);

drop policy if exists "app_state_client_v1_write" on public.app_state_client_v1;
create policy "app_state_client_v1_write"
  on public.app_state_client_v1 for insert
  to anon, authenticated
  with check (true);

drop policy if exists "app_state_client_v1_update" on public.app_state_client_v1;
create policy "app_state_client_v1_update"
  on public.app_state_client_v1 for update
  to anon, authenticated
  using (true)
  with check (true);
