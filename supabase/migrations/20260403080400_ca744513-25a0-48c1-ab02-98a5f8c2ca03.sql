
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create perler_patterns table
CREATE TABLE public.perler_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  grid_data JSONB NOT NULL,
  grid_rows INTEGER NOT NULL DEFAULT 16,
  grid_cols INTEGER NOT NULL DEFAULT 16,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.perler_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public patterns are viewable by everyone"
  ON public.perler_patterns FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own patterns"
  ON public.perler_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns"
  ON public.perler_patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patterns"
  ON public.perler_patterns FOR DELETE
  USING (auth.uid() = user_id);

-- Create pattern_likes table
CREATE TABLE public.pattern_likes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES public.perler_patterns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, pattern_id)
);

ALTER TABLE public.pattern_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes on public patterns"
  ON public.pattern_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like patterns"
  ON public.pattern_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON public.pattern_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create pattern_bookmarks table
CREATE TABLE public.pattern_bookmarks (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES public.perler_patterns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, pattern_id)
);

ALTER TABLE public.pattern_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON public.pattern_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can bookmark patterns"
  ON public.pattern_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks"
  ON public.pattern_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_perler_patterns_updated_at
  BEFORE UPDATE ON public.perler_patterns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_perler_patterns_user_id ON public.perler_patterns(user_id);
CREATE INDEX idx_perler_patterns_public ON public.perler_patterns(is_public) WHERE is_public = true;
CREATE INDEX idx_pattern_likes_pattern ON public.pattern_likes(pattern_id);
