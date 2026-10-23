-- Each passenger can have their own email and phone number, set by the
-- passenger themselves or by the lead passenger from the portal.

alter table public.reservation_passengers
  add column if not exists email text,
  add column if not exists phone text;
