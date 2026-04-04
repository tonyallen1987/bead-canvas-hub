-- Add tags column to perler_patterns
ALTER TABLE public.perler_patterns
ADD COLUMN tags text[] DEFAULT '{}';

-- Add GIN index for efficient tag queries
CREATE INDEX idx_perler_patterns_tags ON public.perler_patterns USING GIN(tags);

-- Add index on category for filtering
CREATE INDEX idx_perler_patterns_category ON public.perler_patterns(category);
