

## Admin Bulk Import Feature

Build an admin page with multi-file drag-and-drop that sends images to a backend function for server-side processing and database insertion.

### Architecture

```text
Browser (Admin Page)                    Edge Function
┌─────────────────────┐                ┌──────────────────────┐
│ Drag & drop images  │───POST────────▶│ bulk-import-patterns │
│ Progress bar UI     │◀──JSON─────────│  - decode image      │
│ Auth-gated route    │                │  - resize to 32×32   │
│                     │                │  - color-match pixels │
│ Sends images as     │                │  - generate metadata  │
│ base64 in batches   │                │  - insert via service │
│ of ~5 at a time     │                │    role key           │
└─────────────────────┘                └──────────────────────┘
```

### Steps

**1. Create edge function `supabase/functions/bulk-import-patterns/index.ts`**
- Accepts POST with JSON body: `{ images: [{ filename, base64 }] }`
- Validates auth via `getClaims()` — only authenticated users can call it (admin check can be added later via a roles table)
- For each image:
  - Decodes base64, uses a Deno-compatible image library (e.g., `imagescript`) to resize to 32x32
  - Maps each pixel to nearest Perler color using the same lightness-weighted Euclidean distance algorithm from `perlerColors.ts`
  - Generates title from filename (strip extension, replace dashes/underscores with spaces, title-case)
  - Auto-assigns category randomly from a set (Gaming, Animals, Nature, Food, Characters, Abstract, Holidays, Sports)
  - Auto-assigns difficulty based on unique color count (≤5 = Easy, ≤12 = Medium, else Hard)
  - Computes bead_count (non-transparent pixel count)
  - Extracts color_palette (unique Perler hex values used)
- Inserts all patterns into `perler_patterns` using the service role key (bypasses RLS)
- Sets `is_public = true`, `grid_rows = 32`, `grid_cols = 32`
- Returns `{ success: true, count: N }` per batch

**2. Create admin page `src/pages/AdminImport.tsx`**
- Route: `/admin-import`, added to App.tsx
- Auth-gated: redirects to `/auth` if not logged in
- UI components:
  - Drag-and-drop zone accepting multiple image files (PNG, JPG, WEBP)
  - File list showing thumbnails and filenames with remove buttons
  - "Start Bulk Import" button
  - Progress bar (`Progress` component) showing completed/total
  - Status log area showing each pattern as it's processed
- Processing logic:
  - Converts each file to base64
  - Sends in batches of 5 to the edge function via `supabase.functions.invoke('bulk-import-patterns', { body })`
  - Updates progress after each batch completes
  - Shows success toast with total count when done

**3. Update `src/App.tsx`**
- Add route: `<Route path="/admin-import" element={<AdminImport />} />`
- Add lazy import for the new page

### Security Notes
- The edge function uses the service role key (available server-side as `SUPABASE_SERVICE_ROLE_KEY`) to bypass RLS for inserts
- The function still validates the caller is authenticated via JWT claims
- No admin role table exists yet — for now, any authenticated user can access the import page. A roles system can be added later if needed.

### Technical Details
- **Image processing in Deno**: Will use `ImageScript` (npm:imagescript) which works in Deno for decoding and resizing images without native dependencies
- **Batch size**: 5 images per request to stay within edge function memory/timeout limits
- **The 48-color palette and matching algorithm** will be duplicated in the edge function since it cannot import from `src/`

