
-- 1. Fix pattern_likes INSERT: ensure pattern is accessible
DROP POLICY IF EXISTS "Authenticated users can like patterns" ON public.pattern_likes;
CREATE POLICY "Authenticated users can like accessible patterns"
  ON public.pattern_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.perler_patterns pp
      WHERE pp.id = pattern_id
        AND (pp.is_public = true OR pp.user_id = auth.uid())
    )
  );

-- 2. Fix pattern_bookmarks INSERT: ensure pattern is accessible
DROP POLICY IF EXISTS "Authenticated users can bookmark patterns" ON public.pattern_bookmarks;
CREATE POLICY "Authenticated users can bookmark accessible patterns"
  ON public.pattern_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.perler_patterns pp
      WHERE pp.id = pattern_id
        AND (pp.is_public = true OR pp.user_id = auth.uid())
    )
  );

-- 3. Fix pattern_likes SELECT: only expose likes on public patterns or own likes
DROP POLICY IF EXISTS "Anyone can view likes on public patterns" ON public.pattern_likes;
CREATE POLICY "Likes on public patterns are viewable by everyone"
  ON public.pattern_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perler_patterns pp
      WHERE pp.id = pattern_likes.pattern_id
        AND pp.is_public = true
    )
    OR auth.uid() = user_id
  );

-- 4. Fix storage INSERT policy for pattern-images: enforce path ownership
DROP POLICY IF EXISTS "Authenticated users can upload pattern images" ON storage.objects;
CREATE POLICY "Users can upload to their own folder in pattern-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pattern-images' AND
    (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 5. Fix profiles SELECT: restrict to profiles with public patterns or own profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles with public patterns are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perler_patterns pp
      WHERE pp.user_id = profiles.id
        AND pp.is_public = true
    )
    OR auth.uid() = id
  );
