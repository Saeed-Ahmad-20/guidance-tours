-- Personal pre-departure checklist in the passenger portal. The list of items
-- lives in code (app/portal/checklist/checklist-items.ts); this only records
-- which items each passenger has ticked.

create table if not exists public.passenger_checklist (
  passenger_id uuid not null references public.reservation_passengers(id) on delete cascade,
  item_key text not null,
  checked_at timestamptz not null default now(),
  primary key (passenger_id, item_key)
);

alter table public.passenger_checklist enable row level security;
-- No policies: only the service-role key (server actions) reads or writes.
