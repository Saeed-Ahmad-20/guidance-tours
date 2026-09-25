-- Passenger portal (portal.guidancetours.co.uk): travel documents that admins
-- upload per booking (flight tickets, train tickets, e-visas), and recorded
-- webinars shown to every signed-in passenger.

insert into storage.buckets (id, name, public)
values ('travel-documents', 'travel-documents', false)
on conflict (id) do nothing;

create table if not exists public.passenger_documents (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  -- Null means the document covers the whole booking (e.g. a group ticket).
  passenger_id uuid references public.reservation_passengers(id) on delete cascade,
  doc_type text not null check (doc_type in ('flight_ticket', 'train_ticket', 'e_visa', 'other')),
  label text not null,
  storage_path text not null,
  mime_type text not null,
  uploaded_by text,
  created_at timestamptz not null default now()
);

create index if not exists passenger_documents_reservation_id_idx
  on public.passenger_documents(reservation_id);

alter table public.passenger_documents enable row level security;

create table if not exists public.webinars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  recorded_on date,
  created_at timestamptz not null default now()
);

alter table public.webinars enable row level security;

-- No policies on either table or on the bucket: only the service-role key
-- (server actions / server components) can read or write, same posture as
-- rate_limits and passport-photos.
