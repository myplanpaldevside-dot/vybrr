-- Add platform commission columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_earnings NUMERIC(10,2);

-- Back-fill existing orders: 10% fee, 90% creator earnings
UPDATE public.orders
SET
  platform_fee     = ROUND(amount * 0.10, 2),
  creator_earnings = ROUND(amount * 0.90, 2)
WHERE platform_fee IS NULL OR platform_fee = 0;
