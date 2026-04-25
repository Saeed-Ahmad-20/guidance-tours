# Deployment guide

This app is a standard Next.js 16 project. It builds and runs on any platform
that can run Node.js (Vercel, Netlify, Cloudflare Pages, Railway, Render, Fly,
a plain VPS with PM2, Docker, etc.). Nothing in the source code hard-requires
Vercel.

## 1. Environment variables

Set these wherever you host — Vercel dashboard, Netlify UI, Docker env,
`/etc/environment`, a `.env.production` loaded by `node --env-file`, etc.
Every one is platform-agnostic.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key (legacy registrations form) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — server-only, never expose |
| `ADMIN_USERNAME` | Shared admin login username |
| `ADMIN_PASSWORD` | Shared admin login password |
| `ADMIN_SESSION_SECRET` | 32+ random bytes hex, signs the admin session cookie |
| `PORTAL_SESSION_SECRET` | 32+ random bytes hex, signs the customer portal cookie |
| `BOOKING_TTL_HOURS` | How long a held booking lives (default `30`) |
| `BOOKING_DISPLAY_TTL_HOURS` | What we *tell* the customer (default `24`) |
| `RESEND_API_KEY` | Resend API key; if unset, emails silently no-op |
| `EMAIL_FROM` | Verified sender, e.g. `Guidance Tours <bookings@guidancetours.co.uk>` |
| `ADMIN_NOTIFICATION_EMAIL` | Where admin notifications go |
| `SITE_URL` | Public site origin, e.g. `https://www.guidancetours.co.uk` |
| `ADMIN_SITE_URL` | Admin origin, e.g. `https://admin.guidancetours.co.uk` |
| `CRON_SECRET` | 32+ random bytes hex, required as a Bearer token by the cron route |

## 2. Supabase

Run the SQL from the session (tables, functions, plus the
`alter table reservations add column if not exists expiry_notified_at timestamptz;`
migration from Phase 5). RLS is enabled with no policies — only the server
service role key can read/write.

## 3. Build and run

```bash
npm ci
npm run build
npm run start -- --port 3000
```

That's it. Reverse-proxy it behind nginx / Caddy / a managed platform and
you're done.

## 4. Admin subdomain (`admin.guidancetours.co.uk`)

The routing is handled entirely by [proxy.ts](proxy.ts) — it inspects the
`Host` header and rewrites `admin.*` requests to `/admin/*` internally. This
works on **every** platform that runs Next.js middleware/proxy (Vercel,
Netlify, Cloudflare Pages, Node self-host). All you do on the host side is:

1. Point both `guidancetours.co.uk` (+ `www`) **and** `admin.guidancetours.co.uk`
   at the same deployment.
2. On Vercel: add the domain under Project → Domains. Both resolve to the
   same build.
3. On other platforms: configure two hostnames → same Node process / same
   build output. If using nginx, a single `server_name` block covering both
   hosts proxying to the Node port works.

## 5. Scheduling the cron (the only Vercel-ish part)

The cron route is at `/api/cron/booking-sweep` and requires:

```
Authorization: Bearer <CRON_SECRET>
```

It should run **every 15 minutes**. Examples by platform:

### Vercel (already configured)

Uses [vercel.json](vercel.json) — nothing else to do. Vercel auto-injects
the Bearer header from the `CRON_SECRET` env var on the production
deployment.

### Netlify Scheduled Functions

Create `netlify/functions/booking-sweep.mts` that `fetch()`s the route
with the Bearer header, and add `schedule = "*/15 * * * *"` to its
`export const config`.

### Cloudflare Workers Cron Triggers

Set a Workers scheduled trigger to `fetch()` your deployment's cron URL
with the Bearer header.

### VPS crontab

```
*/15 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://www.guidancetours.co.uk/api/cron/booking-sweep >> /var/log/booking-sweep.log 2>&1
```

### GitHub Actions

```yaml
name: booking-sweep
on:
  schedule:
    - cron: '*/15 * * * *'
jobs:
  sweep:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -fsS \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://www.guidancetours.co.uk/api/cron/booking-sweep
```

### EasyCron / cron-job.org / Zapier / n8n

Any HTTP cron service works — just schedule a GET with the Bearer header.

> If you never set up external cron, the app still works: the Supabase
> RPC `expire_old_reservations` is called lazily on every availability
> read, so expired holds self-heal. The cron is only needed for 1-hour
> warning emails and expiry notification emails.

## 6. Optional: removing Vercel analytics

If you don't want the Vercel Analytics script loaded on non-Vercel hosts
(it silently fails there), remove `<Analytics />` from
[app/layout.tsx](app/layout.tsx) and drop the `@vercel/analytics`
dependency. Completely optional — the script is harmless elsewhere.
