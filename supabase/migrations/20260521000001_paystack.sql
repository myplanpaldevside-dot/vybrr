ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS bank_code TEXT,
  ADD COLUMN IF NOT EXISTS transfer_code TEXT,
  ADD COLUMN IF NOT EXISTS paystack_recipient_code TEXT;
