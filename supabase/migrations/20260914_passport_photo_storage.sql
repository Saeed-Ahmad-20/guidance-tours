-- Local (Supabase Storage) copy of passport photos, kept alongside the
-- Google Drive upload so the portal can display the photo back to the
-- passenger without depending on Drive sharing/auth.

insert into storage.buckets (id, name, public)
values ('passport-photos', 'passport-photos', false)
on conflict (id) do nothing;

alter table public.reservation_passengers
  add column if not exists passport_photo_path text;

-- No storage.objects policies added: RLS is enabled by default on that table
-- and, with no policies, only the service-role key (used exclusively by our
-- server actions) can read or write objects — same "deny all but service
-- role" posture as rate_limits.
