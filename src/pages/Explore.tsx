import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PatternRow {
  id: string;
  title: string;
  grid_data: string[][];
  grid_rows: number;
  grid_cols: number;
  created_at: string;
  profiles: { username: string | null; display_name: string | null } | null;
}

export default function Explore() {
  const [patterns, setPatterns] = useState<PatternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();

  useEffect(() => {
    loadPatterns();
  }, []);

  useEffect(() => {
    if (user && patterns.length > 0) loadUserInteractions();
  }, [user, patterns]);

  const loadPatterns = async () => {
    const { data } = await supabase
      .from("perler_patterns")
      .select("id, title, grid_data, grid_rows, grid_cols, created_at, profiles(username, display_name)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setPatterns(data as unknown as PatternRow[]);
      // Load like counts
      const ids = data.map((p) => p.id);
      const { data: likes } = await supabase
        .from("pattern_likes")
        .select("pattern_id")
        .in("pattern_id", ids);
      if (likes) {
        const counts: Record<string, number> = {};
        likes.forEach((l) => { counts[l.pattern_id] = (counts[l.pattern_id] || 0) + 1; });
        setLikeCounts(counts);
      }
    }
    setLoading(false);
  };

  const loadUserInteractions = async () => {
    if (!user) return;
    const ids = patterns.map((p) => p.id);
    const [likesRes, bookmarksRes] = await Promise.all([
      supabase.from("pattern_likes").select("pattern_id").eq("user_id", user.id).in("pattern_id", ids),
      supabase.from("pattern_bookmarks").select("pattern_id").eq("user_id", user.id).in("pattern_id", ids),
    ]);
    if (likesRes.data) setLiked(new Set(likesRes.data.map((l) => l.pattern_id)));
    if (bookmarksRes.data) setBookmarked(new Set(bookmarksRes.data.map((b) => b.pattern_id)));
  };

  const toggleLike = async (patternId: string) => {
    if (!user) return;
    const isLiked = liked.has(patternId);
    if (isLiked) {
      await supabase.from("pattern_likes").delete().eq("user_id", user.id).eq("pattern_id", patternId);
      setLiked((prev) => { const n = new Set(prev); n.delete(patternId); return n; });
      setLikeCounts((prev) => ({ ...prev, [patternId]: (prev[patternId] || 1) - 1 }));
    } else {
      await supabase.from("pattern_likes").insert({ user_id: user.id, pattern_id: patternId });
      setLiked((prev) => new Set(prev).add(patternId));
      setLikeCounts((prev) => ({ ...prev, [patternId]: (prev[patternId] || 0) + 1 }));
    }
  };

  const toggleBookmark = async (patternId: string) => {
    if (!user) return;
    const isBookmarked = bookmarked.has(patternId);
    if (isBookmarked) {
      await supabase.from("pattern_bookmarks").delete().eq("user_id", user.id).eq("pattern_id", patternId);
      setBookmarked((prev) => { const n = new Set(prev); n.delete(patternId); return n; });
    } else {
      await supabase.from("pattern_bookmarks").insert({ user_id: user.id, pattern_id: patternId });
      setBookmarked((prev) => new Set(prev).add(patternId));
    }
  };

  if (loading) {
    return (
      <div className="container py-20 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">Explore</h1>
        <p className="text-muted-foreground mt-1">Discover amazing Perler bead creations from the community</p>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-semibold">No patterns shared yet</p>
          <p className="text-sm mt-1">Be the first to share a creation!</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {patterns.map((pattern) => {
            const grid = pattern.grid_data as unknown as string[][];
            const authorName = pattern.profiles?.display_name || pattern.profiles?.username || "Anonymous";
            return (
              <div
                key={pattern.id}
                className="break-inside-avoid bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4 flex justify-center bg-muted/30">
                  <div
                    className="grid gap-px"
                    style={{
                      gridTemplateColumns: `repeat(${pattern.grid_cols}, 1fr)`,
                      width: "100%",
                      maxWidth: 280,
                      aspectRatio: `${pattern.grid_cols}/${pattern.grid_rows}`,
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

                <div className="p-4">
                  <h3 className="font-bold">{pattern.title}</h3>
                  <p className="text-sm text-muted-foreground">@{authorName}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <button
                      onClick={() => toggleLike(pattern.id)}
                      className={cn("flex items-center gap-1 transition-colors", liked.has(pattern.id) && "text-primary")}
                    >
                      <Heart size={16} fill={liked.has(pattern.id) ? "currentColor" : "none"} />
                      {likeCounts[pattern.id] || 0}
                    </button>
                    <Bookmark
                      size={16}
                      className={cn(
                        "ml-auto cursor-pointer transition-colors",
                        bookmarked.has(pattern.id) ? "text-primary fill-primary" : "hover:text-foreground"
                      )}
                      onClick={() => toggleBookmark(pattern.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
