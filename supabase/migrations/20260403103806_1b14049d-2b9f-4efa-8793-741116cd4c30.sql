
-- Add new columns to perler_patterns
ALTER TABLE public.perler_patterns
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS bead_count integer,
  ADD COLUMN IF NOT EXISTS color_palette jsonb,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
