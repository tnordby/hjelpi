-- Allow buyer to remove a booking if checkout failed after insert (no payment yet).
CREATE POLICY "bookings_buyer_delete_unpaid_pending" ON public.bookings FOR DELETE
  USING (
    stripe_payment_intent_id IS NULL
    AND status = 'pending'::public.booking_status
    AND auth.uid() = (SELECT user_id FROM public.profiles WHERE id = buyer_id)
  );
