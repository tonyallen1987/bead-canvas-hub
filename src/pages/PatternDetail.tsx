import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Bookmark, ArrowLeft, Calculator, Download, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import PageMeta from "@/components/PageMeta";

const PALETTE = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#F5F5F0" },
  { name: "Red", hex: "#E84040" },
  { name: "Pink", hex: "#E8708A" },
  { name: "Coral", hex: "#E88570" },
  { name: "Orange", hex: "#E8A040" },
  { name: "Lemon", hex: "#E8D060" },
  { name: "Mint", hex: "#6BC5A0" },
  { name: "Sage", hex: "#88B890" },
  { name: "Sky", hex: "#60B5E8" },
  { name: "Blue", hex: "#4080E8" },
  { name: "Lavender", hex: "#A580D0" },
  { name: "Peach", hex: "#E8B895" },
  { name: "Gray", hex: "#A0A0A0" },
];

interface PatternData {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  bead_count: number | null;
  grid_data: string[][];
  grid_rows: number;
  grid_cols: number;
  created_at: string;
  user_id: string;
  thumbnail_url: string | null;
  profiles: { username: string | null; display_name: string | null } | null;
}

function generatePatternCanvas(grid: string[][], rows: number, cols: number, withWatermark: boolean): HTMLCanvasElement {
  const scale = 20;
  const padding = withWatermark ? 40 : 0;
  const canvas = document.createElement("canvas");
  canvas.width = cols * scale;
  canvas.height = rows * scale + padding;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#F5F5F0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell !== "transparent") {
        ctx.fillStyle = cell;
        ctx.beginPath();
        ctx.arc(c * scale + scale / 2, r * scale + scale / 2, scale / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
      }
    })
  );

  // Watermark
  if (withWatermark) {
    ctx.fillStyle = "#A0A0A0";
    ctx.font = `bold ${Math.max(12, Math.floor(cols * scale * 0.04))}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("perlerly.com", canvas.width / 2, rows * scale + padding / 2 + 4);
  }

  return canvas;
}

export default function PatternDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [pattern, setPattern] = useState<PatternData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showCounter, setShowCounter] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadPattern();
  }, [slug]);

  useEffect(() => {
    if (user && pattern) loadInteractions();
  }, [user, pattern]);

  const loadPattern = async () => {
    // Try slug first, then fall back to id
    let query = supabase
      .from("perler_patterns")
      .select("id, title, slug, description, grid_data, grid_rows, grid_cols, created_at, user_id, profiles!perler_patterns_user_id_fkey(username, display_name)");

    // UUID pattern check
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug!);
    if (isUUID) {
      query = query.eq("id", slug!);
    } else {
      query = query.eq("slug", slug!);
    }

    const { data } = await query.single();

    if (data) {
      setPattern(data as unknown as PatternData);
      const { count } = await supabase
        .from("pattern_likes")
        .select("*", { count: "exact", head: true })
        .eq("pattern_id", (data as any).id);
      setLikeCount(count || 0);
    }
    setLoading(false);
  };

  const loadInteractions = async () => {
    if (!user || !pattern) return;
    const [likesRes, bookmarksRes] = await Promise.all([
      supabase.from("pattern_likes").select("pattern_id").eq("user_id", user.id).eq("pattern_id", pattern.id),
      supabase.from("pattern_bookmarks").select("pattern_id").eq("user_id", user.id).eq("pattern_id", pattern.id),
    ]);
    setLiked((likesRes.data?.length || 0) > 0);
    setBookmarked((bookmarksRes.data?.length || 0) > 0);
  };

  const toggleLike = async () => {
    if (!user || !pattern) return;
    if (liked) {
      await supabase.from("pattern_likes").delete().eq("user_id", user.id).eq("pattern_id", pattern.id);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("pattern_likes").insert({ user_id: user.id, pattern_id: pattern.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !pattern) return;
    if (bookmarked) {
      await supabase.from("pattern_bookmarks").delete().eq("user_id", user.id).eq("pattern_id", pattern.id);
      setBookmarked(false);
    } else {
      await supabase.from("pattern_bookmarks").insert({ user_id: user.id, pattern_id: pattern.id });
      setBookmarked(true);
    }
  };

  const downloadPNG = useCallback(() => {
    if (!pattern) return;
    const grid = pattern.grid_data as unknown as string[][];
    const canvas = generatePatternCanvas(grid, pattern.grid_rows, pattern.grid_cols, true);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${pattern.slug || pattern.title.toLowerCase().replace(/\s+/g, "-")}-perlerly.png`;
    a.click();
  }, [pattern]);

  const shareOnPinterest = useCallback(async () => {
    if (!pattern) return;
    const grid = pattern.grid_data as unknown as string[][];
    const canvas = generatePatternCanvas(grid, pattern.grid_rows, pattern.grid_cols, true);

    // Upload image to storage for a public URL
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
    const filePath = `${pattern.user_id}/${pattern.id}.png`;
    await supabase.storage.from("pattern-images").upload(filePath, blob, { upsert: true, contentType: "image/png" });
    const { data: urlData } = supabase.storage.from("pattern-images").getPublicUrl(filePath);

    const pageUrl = `${window.location.origin}/pattern/${pattern.slug || pattern.id}`;
    const desc = encodeURIComponent(`${pattern.title} - Perler bead pattern on Perlerly.com`);
    const media = encodeURIComponent(urlData.publicUrl);
    const url = encodeURIComponent(pageUrl);

    window.open(
      `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${desc}`,
      "_blank",
      "width=750,height=550"
    );
  }, [pattern]);

  const beadCounts = useMemo(() => {
    if (!pattern) return [];
    const grid = pattern.grid_data as unknown as string[][];
    const counts: Record<string, number> = {};
    grid.flat().forEach((c) => {
      if (c && c !== "transparent") counts[c] = (counts[c] || 0) + 1;
    });
    return PALETTE.filter((p) => counts[p.hex] > 0).map((p) => ({
      ...p,
      count: counts[p.hex],
    }));
  }, [pattern]);

  const totalBeads = beadCounts.reduce((a, b) => a + b.count, 0);

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  if (!pattern) return <div className="container py-20 text-center text-muted-foreground">Pattern not found</div>;

  const grid = pattern.grid_data as unknown as string[][];
  const authorName = pattern.profiles?.display_name || pattern.profiles?.username || "Anonymous";
  const cellSize = Math.min(Math.floor(480 / Math.max(pattern.grid_cols, pattern.grid_rows)), 32);

  return (
    <div className="container py-8 max-w-4xl">
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} /> Back to Explore
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Pattern preview */}
        <div className="flex-1 flex justify-center">
          <div className="bg-muted/30 rounded-2xl border p-6 inline-block">
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: `repeat(${pattern.grid_cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${pattern.grid_rows}, ${cellSize}px)`,
              }}
            >
              {grid.flat().map((color, i) => (
                <span
                  key={i}
                  className="rounded-[1px]"
                  style={{ backgroundColor: color === "transparent" ? "transparent" : color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Info sidebar */}
        <div className="lg:w-72 space-y-5">
          <div>
            <h1 className="text-2xl font-extrabold">{pattern.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">by @{authorName}</p>
            <p className="text-muted-foreground text-xs mt-1">
              {pattern.grid_cols}×{pattern.grid_rows} · {new Date(pattern.created_at).toLocaleDateString()}
            </p>
            {pattern.description && <p className="text-sm mt-3">{pattern.description}</p>}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors", liked && "text-primary border-primary")}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} /> {likeCount}
            </button>
            <button
              onClick={toggleBookmark}
              className={cn("p-2 rounded-xl border transition-colors", bookmarked && "text-primary border-primary")}
            >
              <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Download & Share */}
          <div className="flex gap-2">
            <button
              onClick={downloadPNG}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-border font-bold text-sm hover:bg-muted transition-colors"
            >
              <Download size={16} /> Download
            </button>
            <button
              onClick={shareOnPinterest}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E60023] text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Share2 size={16} /> Pinterest
            </button>
          </div>

          {/* Bead counter toggle */}
          <button
            onClick={() => setShowCounter(!showCounter)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border font-bold text-sm hover:bg-muted transition-colors"
          >
            <Calculator size={16} /> {showCounter ? "Hide" : "Show"} Bead Count
          </button>

          {showCounter && (
            <div className="bg-card rounded-2xl border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Beads</span>
                <span className="font-extrabold">{totalBeads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Colors Used</span>
                <span className="font-extrabold">{beadCounts.length}</span>
              </div>
              <div className="border-t pt-3 space-y-2">
                {beadCounts.map((b) => (
                  <div key={b.hex} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: b.hex }} />
                    <span className="flex-1 font-medium">{b.name}</span>
                    <span className="font-mono text-muted-foreground">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
