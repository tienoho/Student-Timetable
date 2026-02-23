-- Run this in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 12),
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create schedules table
CREATE TABLE schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('fixed', 'personal')) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  color TEXT,
  notes TEXT,
  subject_icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Schedules Policies
CREATE POLICY "Users can view all their schedules" 
  ON schedules FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert personal schedules" 
  ON schedules FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND type = 'personal');

CREATE POLICY "Users can update personal schedules" 
  ON schedules FOR UPDATE 
  USING (auth.uid() = user_id AND type = 'personal');

CREATE POLICY "Users can delete personal schedules" 
  ON schedules FOR DELETE 
  USING (auth.uid() = user_id AND type = 'personal');

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, grade_level)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', CAST(new.raw_user_meta_data->>'grade_level' AS INTEGER));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
