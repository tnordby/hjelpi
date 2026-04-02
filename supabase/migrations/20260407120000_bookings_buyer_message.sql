-- Optional brief from buyer (especially quote / request flows).
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS buyer_message text;
