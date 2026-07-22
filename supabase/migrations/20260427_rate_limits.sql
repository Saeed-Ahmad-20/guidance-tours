-- Persistent rate-limit storage. Replaces the per-instance in-memory Map in
-- app/lib/rate-limit.ts so attackers cannot bypass limits by hopping between
-- warm Fluid Compute / serverless instances.

create table if not exists public.rate_limits (
  scope        text        not null,
  key          text        not null,
  count        integer     not null default 0,
  window_start timestamptz not null default now(),
  primary key (scope, key)
);

create index if not exists rate_limits_window_start_idx
  on public.rate_limits (window_start);

-- Atomic check + increment. Returns true when the request is within the
-- allowed budget for this window, false when the caller should be blocked.
-- Uses INSERT ... ON CONFLICT so the read+write happens in one statement,
-- which serialises concurrent requests for the same (scope, key) pair.
create or replace function public.check_rate_limit(
  p_scope          text,
  p_key            text,
  p_max            integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
  v_window_start timestamptz;
  v_now timestamptz := now();
begin
  insert into public.rate_limits (scope, key, count, window_start)
  values (p_scope, p_key, 1, v_now)
  on conflict (scope, key) do update
    set
      count = case
        when public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
          then 1
        else public.rate_limits.count + 1
      end,
      window_start = case
        when public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
          then v_now
        else public.rate_limits.window_start
      end
  returning count, window_start into v_count, v_window_start;

  return v_count <= p_max;
end;
$$;

create or replace function public.reset_rate_limit(
  p_scope text,
  p_key   text
) returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.rate_limits where scope = p_scope and key = p_key;
$$;

-- Best-effort sweeper. Call from the existing booking-sweep cron, or schedule
-- separately. Buckets older than 24h are stale by definition (longest window
-- we use is 1h), so this just keeps the table small.
create or replace function public.sweep_rate_limits() returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limits
   where window_start < now() - interval '24 hours';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

alter table public.rate_limits enable row level security;
-- No policies: only the service role (which bypasses RLS) should ever touch
-- this table. Anon / authenticated users are denied all access by default.
