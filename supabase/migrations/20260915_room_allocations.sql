-- Physical room grouping for admin room allocation. reservation_passengers
-- already tracks room_type + room_index, but room_index is only a position
-- within one booking's own beds — it says nothing about which *physical*
-- room a bed sits in, since beds of the same type from different bookings
-- can share a room. room_allocations is that physical room, and
-- reservation_passengers.room_allocation_id is the (optional, admin-set)
-- assignment of a bed into one.

create table if not exists public.room_allocations (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  room_type text not null check (room_type in ('quad', 'triple', 'double')),
  label text not null,
  created_at timestamptz not null default now()
);

create index if not exists room_allocations_tour_id_idx
  on public.room_allocations(tour_id);

alter table public.reservation_passengers
  add column if not exists room_allocation_id uuid references public.room_allocations(id) on delete set null;

create index if not exists reservation_passengers_room_allocation_id_idx
  on public.reservation_passengers(room_allocation_id);
