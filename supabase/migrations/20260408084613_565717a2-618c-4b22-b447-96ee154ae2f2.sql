CREATE OR REPLACE FUNCTION public.get_pattern_category_counts()
RETURNS TABLE(category text, cnt bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT category, COUNT(*) as cnt
  FROM public.perler_patterns
  WHERE is_public = true AND category IS NOT NULL
  GROUP BY category
  ORDER BY category;
$$;