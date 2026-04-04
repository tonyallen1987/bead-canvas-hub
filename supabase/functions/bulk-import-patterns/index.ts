const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { createClient } from "npm:@supabase/supabase-js@2";
import { decode as decodePng } from "https://deno.land/x/pngs@0.1.1/mod.ts";

// --- Perler color palette ---
interface PerlerColor {
  id: string;
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

const PERLER_COLORS: PerlerColor[] = [
  { id: "black", name: "Black", hex: "#000000", r: 0, g: 0, b: 0 },
  { id: "white", name: "White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
  { id: "grey", name: "Grey", hex: "#95A5A6", r: 149, g: 165, b: 166 },
  { id: "dark-grey", name: "Dark Grey", hex: "#7F8C8D", r: 127, g: 140, b: 141 },
  { id: "red", name: "Red", hex: "#BE3128", r: 190, g: 49, b: 40 },
  { id: "cherry", name: "Cherry", hex: "#922B21", r: 146, g: 43, b: 33 },
  { id: "cranapple", name: "Cranapple", hex: "#7B241C", r: 123, g: 36, b: 28 },
  { id: "hot-coral", name: "Hot Coral", hex: "#FF7F50", r: 255, g: 127, b: 80 },
  { id: "orange", name: "Orange", hex: "#F39C12", r: 243, g: 156, b: 18 },
  { id: "cheddar", name: "Cheddar", hex: "#F1C40F", r: 241, g: 196, b: 15 },
  { id: "yellow", name: "Yellow", hex: "#F4D03F", r: 244, g: 208, b: 63 },
  { id: "pastel-yellow", name: "Pastel Yellow", hex: "#FCF3CF", r: 252, g: 243, b: 207 },
  { id: "kiwi-lime", name: "Kiwi Lime", hex: "#A2D149", r: 162, g: 209, b: 73 },
  { id: "bright-green", name: "Bright Green", hex: "#2ECC71", r: 46, g: 204, b: 113 },
  { id: "dark-green", name: "Dark Green", hex: "#1D8348", r: 29, g: 131, b: 72 },
  { id: "parrot-green", name: "Parrot Green", hex: "#27AE60", r: 39, g: 174, b: 96 },
  { id: "light-blue", name: "Light Blue", hex: "#AED6F1", r: 174, g: 214, b: 241 },
  { id: "dark-blue", name: "Dark Blue", hex: "#2E86C1", r: 46, g: 134, b: 193 },
  { id: "blueberry", name: "Blueberry", hex: "#1F618D", r: 31, g: 97, b: 141 },
  { id: "periwinkle", name: "Periwinkle", hex: "#85C1E9", r: 133, g: 193, b: 233 },
  { id: "purple", name: "Purple", hex: "#8E44AD", r: 142, g: 68, b: 173 },
  { id: "plum", name: "Plum", hex: "#6C3483", r: 108, g: 52, b: 131 },
  { id: "pink", name: "Pink", hex: "#FADBD8", r: 250, g: 219, b: 216 },
  { id: "bubblegum", name: "Bubblegum", hex: "#F1948A", r: 241, g: 148, b: 138 },
  { id: "tan", name: "Tan", hex: "#D2B48C", r: 210, g: 180, b: 140 },
  { id: "light-brown", name: "Light Brown", hex: "#A04000", r: 160, g: 64, b: 0 },
  { id: "brown", name: "Brown", hex: "#6E2C00", r: 110, g: 44, b: 0 },
  { id: "rust", name: "Rust", hex: "#BA4A00", r: 186, g: 74, b: 0 },
  { id: "sand", name: "Sand", hex: "#EDBB99", r: 237, g: 187, b: 153 },
  { id: "peach", name: "Peach", hex: "#FFDAB9", r: 255, g: 218, b: 185 },
  { id: "blush", name: "Blush", hex: "#FFB6C1", r: 255, g: 182, b: 193 },
  { id: "lavender", name: "Lavender", hex: "#D7BDE2", r: 215, g: 189, b: 226 },
  { id: "mint", name: "Mint", hex: "#D1F2EB", r: 209, g: 242, b: 235 },
  { id: "toothpaste", name: "Toothpaste", hex: "#A9CCE3", r: 169, g: 204, b: 227 },
  { id: "robin-egg", name: "Robin Egg", hex: "#81D4FA", r: 129, g: 212, b: 250 },
  { id: "turquoise", name: "Turquoise", hex: "#48C9B0", r: 72, g: 201, b: 176 },
  { id: "shamrock", name: "Shamrock", hex: "#16A085", r: 22, g: 160, b: 133 },
  { id: "olive", name: "Olive", hex: "#808000", r: 128, g: 128, b: 0 },
  { id: "gold", name: "Gold", hex: "#D4AC0D", r: 212, g: 172, b: 13 },
  { id: "butterscotch", name: "Butterscotch", hex: "#E67E22", r: 230, g: 126, b: 34 },
  { id: "toffee", name: "Toffee", hex: "#CA6F1E", r: 202, g: 111, b: 30 },
  { id: "midnight", name: "Midnight", hex: "#1B2631", r: 27, g: 38, b: 49 },
  { id: "mulberry", name: "Mulberry", hex: "#7D3C98", r: 125, g: 60, b: 152 },
  { id: "raspberry", name: "Raspberry", hex: "#C0392B", r: 192, g: 57, b: 43 },
  { id: "apricot", name: "Apricot", hex: "#F5B041", r: 245, g: 176, b: 65 },
  { id: "honey", name: "Honey", hex: "#F39C12", r: 243, g: 156, b: 18 },
  { id: "sage", name: "Sage", hex: "#ABB2B9", r: 171, g: 178, b: 185 },
  { id: "sky", name: "Sky", hex: "#5DADE2", r: 93, g: 173, b: 226 },
];

function nearestPerlerColor(r: number, g: number, b: number): string {
  let best = PERLER_COLORS[0];
  let bestDist = Infinity;
  const srcL = 0.299 * r + 0.587 * g + 0.114 * b;
  for (const c of PERLER_COLORS) {
    const cL = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    const dL = srcL - cL;
    const dr = r - c.r;
    const dg = g - c.g;
    const db = b - c.b;
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db + 3 * dL * dL;
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best.hex;
}

const CATEGORIES = ["Gaming", "Animals", "Nature", "Food", "Characters", "Abstract", "Holidays", "Sports"];

function titleFromFilename(filename: string): string {
  const name = filename.replace(/\.[^.]+$/, "");
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || "Untitled Pattern";
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "pattern";
}

/** Nearest-neighbor resize of RGBA pixel data */
function resizePixels(
  src: Uint8Array,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Uint8Array {
  const dst = new Uint8Array(dstW * dstH * 4);
  for (let y = 0; y < dstH; y++) {
    const sy = Math.floor(y * srcH / dstH);
    for (let x = 0; x < dstW; x++) {
      const sx = Math.floor(x * srcW / dstW);
      const si = (sy * srcW + sx) * 4;
      const di = (y * dstW + x) * 4;
      dst[di] = src[si];
      dst[di + 1] = src[si + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = src[si + 3];
    }
  }
  return dst;
}

/** Decode image bytes to RGBA pixels. Supports PNG natively, JPEG/WebP via ImageBitmap. */
async function decodeImage(bytes: Uint8Array): Promise<{ width: number; height: number; data: Uint8Array }> {
  // Check for PNG signature
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    const png = decodePng(bytes);
    return { width: png.width, height: png.height, data: new Uint8Array(png.image) };
  }

  // For JPEG/WebP, try createImageBitmap + OffscreenCanvas
  const blob = new Blob([bytes]);
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  return { width: bitmap.width, height: bitmap.height, data: new Uint8Array(imageData.data.buffer) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { images } = await req.json() as {
      images: { filename: string; base64: string }[];
    };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "No images provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { title: string; success: boolean; error?: string }[] = [];

    for (const img of images) {
      try {
        const raw = img.base64.includes(",") ? img.base64.split(",")[1] : img.base64;
        const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));

        const decoded = await decodeImage(bytes);
        const resized = resizePixels(decoded.data, decoded.width, decoded.height, 32, 32);

        const gridData: string[][] = [];
        const paletteSet = new Set<string>();
        let beadCount = 0;

        for (let y = 0; y < 32; y++) {
          const row: string[] = [];
          for (let x = 0; x < 32; x++) {
            const i = (y * 32 + x) * 4;
            const r = resized[i];
            const g = resized[i + 1];
            const b = resized[i + 2];
            const a = resized[i + 3];

            if (a < 128) {
              row.push("transparent");
            } else {
              const hex = nearestPerlerColor(r, g, b);
              row.push(hex);
              paletteSet.add(hex);
              beadCount++;
            }
          }
          gridData.push(row);
        }

        const title = titleFromFilename(img.filename);
        const uniqueColors = paletteSet.size;
        const difficulty = uniqueColors <= 5 ? "Easy" : uniqueColors <= 12 ? "Medium" : "Hard";
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

        const { error: insertError } = await adminClient.from("perler_patterns").insert({
          title,
          slug: generateSlug(title) + "-" + Date.now(),
          grid_data: gridData,
          grid_rows: 32,
          grid_cols: 32,
          is_public: true,
          user_id: user.id,
          category,
          difficulty,
          bead_count: beadCount,
          color_palette: Array.from(paletteSet),
          description: `Auto-imported ${title} pattern with ${uniqueColors} colors.`,
        });

        if (insertError) {
          results.push({ title, success: false, error: insertError.message });
        } else {
          results.push({ title, success: true });
        }
      } catch (e) {
        results.push({
          title: img.filename,
          success: false,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: results.filter((r) => r.success).length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
