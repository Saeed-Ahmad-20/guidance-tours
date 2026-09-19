-- A reservation can end up with passengers priced under different promo
-- codes (e.g. one person in a group booking qualifies for a different code
-- than the rest) even though reservations.promo_code only records one value
-- for the whole booking, and total_cost_gbp is a single combined figure.
-- The financial breakdown page needs to split that total back out per
-- passenger; without this it can only assume every passenger of the same
-- room type paid an equal share, which is wrong whenever pricing was mixed.
--
-- price_override_gbp lets an admin record what a specific passenger actually
-- paid so the breakdown uses that figure directly for them, and prorates the
-- reservation's remaining total (after subtracting any overrides) across the
-- rest as before. NULL (the default) means "use the proportional split".
alter table public.reservation_passengers
  add column if not exists price_override_gbp integer;
