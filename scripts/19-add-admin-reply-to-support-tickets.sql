-- Add admin reply fields to support_tickets so admins can respond to users
-- Run this in Supabase SQL editor or your migration pipeline

-- 1) Add columns for admin reply message, timestamp, and responder
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS admin_reply TEXT,
  ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_reply_by UUID REFERENCES public.profiles(id);

-- 2) Optional: index for filtering/responded tickets (uncomment if needed)
-- CREATE INDEX IF NOT EXISTS idx_support_tickets_admin_reply_at ON public.support_tickets(admin_reply_at DESC);

-- 3) Notes:
-- - RLS: existing admin UPDATE policy should already allow updating these columns.
-- - UI: the admin panel will use these fields to save status + a message to the user.
-- - If you need multiple replies/history, consider a separate table like public.support_ticket_updates.