import { Heart, Bookmark, TrendingUp, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PatternRow {
  id: string;
  title: string;
  slug: string | null;
  grid_data: string[][];
  grid_rows: number;
  grid_cols: number;
  created_at: string;
  profiles: { username: string | null; display_name: string | null } | null;
}

type SortMode = "recent" | "liked";

export default function Explore() {
  const [patterns, setPatterns] = useState<PatternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [sort, setSort] = useState<SortMode>("recent");
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
      .limit(50);

    if (data) {
      setPatterns(data as unknown as PatternRow[]);
      const ids = data.map((p) => p.id);
      if (ids.length > 0) {
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

  const toggleLike = async (e: React.MouseEvent, patternId: string) => {
    e.preventDefault();
    e.stopPropagation();
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

  const toggleBookmark = async (e: React.MouseEvent, patternId: string) => {
    e.preventDefault();
    e.stopPropagation();
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

  const sortedPatterns = [...patterns].sort((a, b) => {
    if (sort === "liked") return (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Explore</h1>
          <p className="text-muted-foreground mt-1">Discover amazing Perler bead creations from the community</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setSort("recent")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors",
              sort === "recent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock size={14} /> Recent
          </button>
          <button
            onClick={() => setSort("liked")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors",
              sort === "liked" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp size={14} /> Most Liked
          </button>
        </div>
      </div>

      {sortedPatterns.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-semibold">No patterns shared yet</p>
          <p className="text-sm mt-1">Be the first to share a creation!</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {sortedPatterns.map((pattern) => {
            const grid = pattern.grid_data as unknown as string[][];
            const authorName = pattern.profiles?.display_name || pattern.profiles?.username || "Anonymous";
            return (
              <Link
                key={pattern.id}
                to={`/pattern/${pattern.id}`}
                className="break-inside-avoid bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow block"
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
                      onClick={(e) => toggleLike(e, pattern.id)}
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
                      onClick={(e) => toggleBookmark(e, pattern.id)}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
