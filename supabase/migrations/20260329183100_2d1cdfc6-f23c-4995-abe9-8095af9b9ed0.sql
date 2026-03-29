
-- Create enums
CREATE TYPE public.user_role AS ENUM ('creator', 'client', 'both');
CREATE TYPE public.creator_level AS ENUM ('rising', 'pro', 'expert');
CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'revision_requested', 'delivered', 'completed', 'cancelled');

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  role user_role NOT NULL DEFAULT 'client',
  creator_level creator_level DEFAULT 'rising',
  skills TEXT[] DEFAULT '{}',
  response_time TEXT DEFAULT 'Within 24 hours',
  total_orders INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  is_profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Vybs (services/gigs) table
CREATE TABLE public.vybs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  delivery_time INTEGER DEFAULT 7,
  revision_count INTEGER DEFAULT 2,
  is_published BOOLEAN DEFAULT false,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vybs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published vybs are viewable by everyone" ON public.vybs FOR SELECT USING (is_published = true OR creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Creators can insert their own vybs" ON public.vybs FOR INSERT WITH CHECK (creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Creators can update their own vybs" ON public.vybs FOR UPDATE USING (creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Creators can delete their own vybs" ON public.vybs FOR DELETE USING (creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Vyb tiers (pricing tiers)
CREATE TABLE public.vyb_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vyb_id UUID NOT NULL REFERENCES public.vybs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  delivery_days INTEGER NOT NULL DEFAULT 7,
  revision_count INTEGER NOT NULL DEFAULT 2,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vyb_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vyb tiers are viewable by everyone" ON public.vyb_tiers FOR SELECT USING (true);
CREATE POLICY "Creators can manage their vyb tiers" ON public.vyb_tiers FOR INSERT WITH CHECK (vyb_id IN (SELECT id FROM public.vybs WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Creators can update their vyb tiers" ON public.vyb_tiers FOR UPDATE USING (vyb_id IN (SELECT id FROM public.vybs WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Creators can delete their vyb tiers" ON public.vyb_tiers FOR DELETE USING (vyb_id IN (SELECT id FROM public.vybs WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Vyb media
CREATE TABLE public.vyb_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vyb_id UUID NOT NULL REFERENCES public.vybs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  title TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vyb_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vyb media is viewable by everyone" ON public.vyb_media FOR SELECT USING (true);
CREATE POLICY "Creators can manage their vyb media" ON public.vyb_media FOR INSERT WITH CHECK (vyb_id IN (SELECT id FROM public.vybs WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Creators can update their vyb media" ON public.vyb_media FOR UPDATE USING (vyb_id IN (SELECT id FROM public.vybs WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Creators can delete their vyb media" ON public.vyb_media FOR DELETE USING (vyb_id IN (SELECT id FROM public.vybs WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  vyb_id UUID NOT NULL REFERENCES public.vybs(id),
  tier_id UUID NOT NULL REFERENCES public.vyb_tiers(id),
  status order_status NOT NULL DEFAULT 'pending',
  requirements TEXT,
  requirements_file_url TEXT,
  amount NUMERIC(10,2) NOT NULL,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  delivery_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can create orders" ON public.orders FOR INSERT WITH CHECK (
  client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Order participants can update orders" ON public.orders FOR UPDATE USING (
  client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Order messages
CREATE TABLE public.order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT,
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order participants can view messages" ON public.order_messages FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Order participants can send messages" ON public.order_messages FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Message senders can update their messages" ON public.order_messages FOR UPDATE USING (
  sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Order deliverables
CREATE TABLE public.order_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order participants can view deliverables" ON public.order_deliverables FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Creators can upload deliverables" ON public.order_deliverables FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  vyb_id UUID NOT NULL REFERENCES public.vybs(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for their orders" ON public.reviews FOR INSERT WITH CHECK (
  client_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vybs_updated_at BEFORE UPDATE ON public.vybs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('vyb-media', 'vyb-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('deliverables', 'deliverables', false);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vyb media is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'vyb-media');
CREATE POLICY "Creators can upload vyb media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vyb-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators can update vyb media" ON storage.objects FOR UPDATE USING (bucket_id = 'vyb-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators can delete vyb media" ON storage.objects FOR DELETE USING (bucket_id = 'vyb-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Deliverable participants can view" ON storage.objects FOR SELECT USING (bucket_id = 'deliverables');
CREATE POLICY "Users can upload deliverables" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'deliverables' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Design', 'design', 'Palette'),
  ('Video', 'video', 'Video'),
  ('Music', 'music', 'Music'),
  ('Writing', 'writing', 'PenTool'),
  ('Code', 'code', 'Code'),
  ('Photography', 'photography', 'Camera'),
  ('Animation', 'animation', 'Clapperboard');

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
