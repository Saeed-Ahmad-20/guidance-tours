-- Separate bookings that are actually travelling together share a travel_group id, so the key-card
-- planner can hand their cards to one lead passenger.

alter table public.reservations
  add column if not exists travel_group uuid;

create index if not exists reservations_travel_group_idx
  on public.reservations(travel_group)
  where travel_group is not null;
