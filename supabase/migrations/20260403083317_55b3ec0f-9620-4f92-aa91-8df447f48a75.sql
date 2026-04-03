
-- Add slug column
ALTER TABLE public.perler_patterns ADD COLUMN slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_perler_patterns_slug ON public.perler_patterns(slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_pattern_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert title to slug: lowercase, replace non-alphanum with hyphens, trim
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- If empty, use 'pattern'
  IF base_slug = '' THEN
    base_slug := 'pattern';
  END IF;
  
  final_slug := base_slug;
  
  -- Handle duplicates by appending a number
  WHILE EXISTS (SELECT 1 FROM public.perler_patterns WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate slug on insert/update
CREATE TRIGGER generate_slug_trigger
BEFORE INSERT OR UPDATE OF title ON public.perler_patterns
FOR EACH ROW
EXECUTE FUNCTION public.generate_pattern_slug();

-- Backfill existing patterns with slugs
UPDATE public.perler_patterns SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- Create storage bucket for pattern preview images
INSERT INTO storage.buckets (id, name, public) VALUES ('pattern-images', 'pattern-images', true);

-- Storage policies
CREATE POLICY "Pattern images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'pattern-images');

CREATE POLICY "Authenticated users can upload pattern images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pattern-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own pattern images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pattern-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pattern images"
ON storage.objects FOR DELETE
USING (bucket_id = 'pattern-images' AND auth.uid()::text = (storage.foldername(name))[1]);
