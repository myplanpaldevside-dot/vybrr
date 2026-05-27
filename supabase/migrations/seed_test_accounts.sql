-- ============================================================
-- Vybrr Test Seed — run AFTER signing up both accounts via UI
-- ============================================================

-- 1. Set up creator profile
UPDATE public.profiles
SET
  username        = 'tunde_creates',
  display_name    = 'Tunde Bakare',
  bio             = 'UI/UX designer & motion graphics artist based in Lagos. 5+ years crafting digital experiences for startups and global brands.',
  location        = 'Lagos, Nigeria',
  role            = 'creator',
  creator_level   = 'pro',
  skills          = ARRAY['UI/UX Design', 'Motion Graphics', 'Brand Identity', 'Graphic Design'],
  response_time   = 'Within 2 hours',
  avg_rating      = 4.8,
  is_profile_complete = true
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creator@vybrr.test');

-- 2. Set up client profile
UPDATE public.profiles
SET
  username        = 'chioma_client',
  display_name    = 'Chioma Okafor',
  bio             = 'Product manager at a fintech startup. Always looking for top creative talent.',
  location        = 'Abuja, Nigeria',
  role            = 'client',
  is_profile_complete = true
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'client@vybrr.test');

-- 3. Create a sample Vyb for the creator
WITH creator AS (
  SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creator@vybrr.test')
),
cat AS (
  SELECT id FROM public.categories WHERE slug = 'design' LIMIT 1
),
new_vyb AS (
  INSERT INTO public.vybs (creator_id, category_id, title, description, delivery_time, revision_count, is_published, avg_rating)
  SELECT
    creator.id,
    cat.id,
    'I will design a stunning mobile app UI in Figma',
    'Get a clean, modern mobile app UI designed in Figma with full component library, auto-layout, and handoff-ready specs. I specialise in fintech, e-commerce, and SaaS products.',
    5,
    3,
    true,
    4.8
  FROM creator, cat
  RETURNING id
)
-- 4. Add pricing tiers to the Vyb
INSERT INTO public.vyb_tiers (vyb_id, name, price, description, delivery_days, revision_count, features)
SELECT
  new_vyb.id,
  tier.name,
  tier.price,
  tier.description,
  tier.delivery_days,
  tier.revision_count,
  tier.features
FROM new_vyb,
(VALUES
  ('Basic',    5000,  'Up to 3 screens, basic components',                    3, 1, ARRAY['3 screens', 'Basic components', 'Figma file']),
  ('Standard', 15000, 'Up to 10 screens, full component library',            5, 3, ARRAY['10 screens', 'Full component library', 'Auto-layout', 'Figma file']),
  ('Premium',  35000, 'Full app UI (up to 30 screens) with design system',   7, 5, ARRAY['30 screens', 'Design system', 'Prototype', 'Dev handoff', 'Figma file'])
) AS tier(name, price, description, delivery_days, revision_count, features);

-- 5. Create a sample completed order between them
WITH creator AS (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creator@vybrr.test')),
     client  AS (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'client@vybrr.test')),
     vyb     AS (SELECT id FROM public.vybs WHERE creator_id = (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creator@vybrr.test')) LIMIT 1),
     tier    AS (SELECT id FROM public.vyb_tiers WHERE vyb_id = (SELECT id FROM public.vybs WHERE creator_id = (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creator@vybrr.test')) LIMIT 1) AND name = 'Standard' LIMIT 1)
INSERT INTO public.orders (client_id, creator_id, vyb_id, tier_id, status, requirements, amount, payment_reference, payment_status, delivery_date, completed_at)
SELECT
  client.id,
  creator.id,
  vyb.id,
  tier.id,
  'completed',
  'I need a 10-screen UI for my fintech app. Primary colour is purple (#7c5cfc). Target users are young Nigerians aged 18-35.',
  15000,
  'vybrr_test_ref_001',
  'success',
  now() - interval '2 days',
  now() - interval '1 day'
FROM creator, client, vyb, tier;

-- 6. Add a sample review on that order
WITH ord AS (
  SELECT o.id, o.client_id, o.creator_id, o.vyb_id
  FROM public.orders o
  WHERE o.payment_reference = 'vybrr_test_ref_001'
  LIMIT 1
)
INSERT INTO public.reviews (order_id, client_id, creator_id, vyb_id, rating, comment)
SELECT id, client_id, creator_id, vyb_id, 5, 'Absolutely brilliant work! Tunde delivered exactly what I envisioned — clean, modern, and pixel-perfect. Will definitely hire again.'
FROM ord;

-- 7. Create a sample in-progress order so the creator has an active order to test
WITH creator AS (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creator@vybrr.test')),
     client  AS (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'client@vybrr.test')),
     vyb     AS (SELECT id FROM public.vybs WHERE creator_id = (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creator@vybrr.test')) LIMIT 1),
     tier    AS (SELECT id FROM public.vyb_tiers WHERE vyb_id = (SELECT id FROM public.vybs WHERE creator_id = (SELECT id FROM public.profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'creator@vybrr.test')) LIMIT 1) AND name = 'Premium' LIMIT 1)
INSERT INTO public.orders (client_id, creator_id, vyb_id, tier_id, status, requirements, amount, payment_reference, payment_status, delivery_date)
SELECT
  client.id,
  creator.id,
  vyb.id,
  tier.id,
  'in_progress',
  'Full app redesign for my e-commerce platform. Needs dark mode support, 30 screens total.',
  35000,
  'vybrr_test_ref_002',
  'success',
  now() + interval '5 days'
FROM creator, client, vyb, tier;
