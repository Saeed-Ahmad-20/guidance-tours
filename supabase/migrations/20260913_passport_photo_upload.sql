-- Tracks whether a passenger's passport photo has been uploaded to Google
-- Drive from the portal, so the "uploaded" state survives a page refresh
-- and is visible to admins.

alter table public.reservation_passengers
  add column if not exists passport_photo_uploaded_at timestamptz;
