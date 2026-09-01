-- Run this entire script in the Supabase SQL Editor

-- Create ENUMs
CREATE TYPE user_role AS ENUM ('member', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE event_registration_type AS ENUM ('internal', 'external');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'archived');

-- Create Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'member' NOT NULL,
  student_id TEXT NOT NULL,
  branch TEXT NOT NULL,
  year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 6),
  membership_status user_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  venue TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  banner_image_url TEXT,
  registration_type event_registration_type DEFAULT 'external' NOT NULL,
  external_registration_url TEXT,
  capacity INTEGER,
  registered_count INTEGER DEFAULT 0 NOT NULL,
  status event_status DEFAULT 'draft' NOT NULL,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Event Registrations table (Many-to-Many relationship)
CREATE TABLE public.event_registrations (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (event_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for Users table
-- 1. Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- 2. Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Policies for Events table
-- 1. Anyone can read published events
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published');
-- 2. Admins can manage all events
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for Event Registrations
-- 1. Users can see their own registrations
CREATE POLICY "Users can view own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
-- 2. Admins can see all registrations
CREATE POLICY "Admins can view all registrations" ON public.event_registrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
-- 3. Users can register themselves
CREATE POLICY "Users can register themselves" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 4. Users can unregister themselves
CREATE POLICY "Users can unregister themselves" ON public.event_registrations FOR DELETE USING (auth.uid() = user_id);

-- Trigger to create a user record automatically when they sign up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, student_id, branch, year_of_study)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'branch',
    (new.raw_user_meta_data->>'year_of_study')::integer
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
