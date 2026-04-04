import PageMeta from "@/components/PageMeta";
import { Heart, Bookmark, TrendingUp, Clock, User, Sparkles, Camera, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { seedPatterns, type SeedPattern } from "@/data/seedPatterns";

interface PatternRow {
  id: string;
  title: string;
  slug: string | null;
  grid_data: string[][];
  grid_rows: number;
  grid_cols: number;
  created_at: string;
  profiles: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
}

type DisplayPattern = {
  id: string;
  title: string;
  slug: string;
  grid_data: string[][];
  grid_rows: number;
  grid_cols: number;
  created_at: string;
  authorName: string;
  avatarUrl: string | null;
  isSeed: boolean;
  difficulty: { label: string; color: string };
  beadCount: number;
};

type SortMode = "recent" | "liked";

const PAGE_SIZE = 20;

function getBeadCount(grid: string[][]): number {
  return grid.flat().filter((c) => c && c !== "transparent").length;
}

function getDifficulty(beadCount: number, cols: number): { label: string; color: string } {
  if (beadCount <= 150 || cols <= 12) return { label: "Easy", color: "bg-explore-easy text-white" };
  if (beadCount <= 500 || cols <= 24) return { label: "Medium", color: "bg-explore-medium text-white" };
  return { label: "Hard", color: "bg-explore-hard text-white" };
}

function SkeletonCard() {
  return (
    <div className="break-inside-avoid mb-4 bg-card rounded-xl border border-border/60 overflow-hidden animate-pulse">
      <div className="bg-muted/50 w-full" style={{ paddingBottom: `${60 + Math.random() * 40}%` }} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded-md w-3/4" />
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded-full w-16" />
          <div className="h-5 bg-muted rounded-full w-12" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted" />
          <div className="h-3 bg-muted rounded-md w-20" />
        </div>
      </div>
    </div>
  );
}

function CTACard() {
  return (
    <Link
      to="/designer?import=true"
      className="break-inside-avoid mb-4 block group"
    >
      <div className="bg-gradient-to-br from-explore-active/10 via-explore-easy/10 to-explore-medium/10 rounded-xl border-2 border-dashed border-explore-active/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-12px_hsl(var(--explore-active)/0.3)] hover:border-explore-active/70 p-8 flex flex-col items-center justify-center text-center min-h-[260px] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-explore-active/15 flex items-center justify-center">
          <Camera size={28} className="text-explore-active" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg leading-snug">Have a photo?</h3>
          <p className="text-muted-foreground text-sm mt-1">Turn it into a bead pattern!</p>
        </div>
        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-explore-active text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-shadow">
          <Sparkles size={16} /> Try AI Converter
        </span>
      </div>
    </Link>
  );
}

export default function Explore() {
  const [patterns, setPatterns] = useState<PatternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [sort, setSort] = useState<SortMode>("recent");
  const { user } = useAuth();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadPatterns(true); }, []);
  useEffect(() => { if (user && patterns.length > 0) loadUserInteractions(); }, [user, patterns]);

  const loadPatterns = async (initial = false) => {
    if (initial) {
      setLoading(true);
      setPatterns([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    const from = initial ? 0 : patterns.length;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from("perler_patterns")
      .select("id, title, slug, grid_data, grid_rows, grid_cols, created_at, profiles!perler_patterns_user_id_fkey(username, display_name, avatar_url)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) {
      const newPatterns = data as unknown as PatternRow[];
      setPatterns((prev) => initial ? newPatterns : [...prev, ...newPatterns]);
      if (newPatterns.length < PAGE_SIZE) setHasMore(false);

      // Load like counts for new patterns
      const ids = newPatterns.map((p) => p.id);
      if (ids.length > 0) {
        const { data: likes } = await supabase.from("pattern_likes").select("pattern_id").in("pattern_id", ids);
        if (likes) {
          const counts: Record<string, number> = {};
          likes.forEach((l) => { counts[l.pattern_id] = (counts[l.pattern_id] || 0) + 1; });
          setLikeCounts((prev) => ({ ...prev, ...counts }));
        }
      }
    } else {
      setHasMore(false);
    }

    if (initial) setLoading(false);
    setLoadingMore(false);
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadPatterns(false);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, patterns.length]);

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
    e.preventDefault(); e.stopPropagation();
    if (!user || patternId.startsWith("seed-")) return;
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
    e.preventDefault(); e.stopPropagation();
    if (!user || patternId.startsWith("seed-")) return;
    const isBookmarked = bookmarked.has(patternId);
    if (isBookmarked) {
      await supabase.from("pattern_bookmarks").delete().eq("user_id", user.id).eq("pattern_id", patternId);
      setBookmarked((prev) => { const n = new Set(prev); n.delete(patternId); return n; });
    } else {
      await supabase.from("pattern_bookmarks").insert({ user_id: user.id, pattern_id: patternId });
      setBookmarked((prev) => new Set(prev).add(patternId));
    }
  };

  // Merge DB patterns with seed patterns
  const displayPatterns: DisplayPattern[] = useMemo(() => {
    const dbItems: DisplayPattern[] = patterns.map((p) => {
      const grid = p.grid_data as unknown as string[][];
      const beadCount = getBeadCount(grid);
      return {
        id: p.id,
        title: p.title,
        slug: p.slug || p.id,
        grid_data: grid,
        grid_rows: p.grid_rows,
        grid_cols: p.grid_cols,
        created_at: p.created_at,
        authorName: p.profiles?.display_name || p.profiles?.username || "Anonymous",
        avatarUrl: (p.profiles as any)?.avatar_url || null,
        isSeed: false,
        difficulty: getDifficulty(beadCount, p.grid_cols),
        beadCount,
      };
    });

    const seeds: DisplayPattern[] = seedPatterns.map((s) => {
      const beadCount = getBeadCount(s.grid_data);
      return {
        id: s.id,
        title: s.title,
        slug: s.slug,
        grid_data: s.grid_data,
        grid_rows: s.grid_rows,
        grid_cols: s.grid_cols,
        created_at: s.created_at,
        authorName: s.author,
        avatarUrl: null,
        isSeed: true,
        difficulty: s.difficulty === "Easy"
          ? { label: "Easy", color: "bg-explore-easy text-white" }
          : { label: "Medium", color: "bg-explore-medium text-white" },
        beadCount,
      };
    });

    const all = [...dbItems, ...seeds];

    all.sort((a, b) => {
      if (sort === "liked") return (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return all;
  }, [patterns, sort, likeCounts]);

  // Insert CTA card at position 3
  const renderItems = useMemo(() => {
    const items: (DisplayPattern | "cta")[] = [];
    displayPatterns.forEach((p, i) => {
      if (i === 3) items.push("cta");
      items.push(p);
    });
    if (displayPatterns.length <= 3) items.push("cta");
    return items;
  }, [displayPatterns]);

  return (
    <div className="min-h-screen grid-pattern">
      <div className="container py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Explore</h1>
            <p className="text-muted-foreground mt-1.5 text-base">Discover bead creations from the community</p>
          </div>
          <div className="flex gap-1.5 bg-card border rounded-xl p-1">
            <button
              onClick={() => setSort("recent")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                sort === "recent" ? "bg-explore-active text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock size={14} /> Recent
            </button>
            <button
              onClick={() => setSort("liked")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                sort === "liked" ? "bg-explore-active text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TrendingUp size={14} /> Popular
            </button>
          </div>
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Masonry grid */}
        {!loading && (
          <>
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
              {renderItems.map((item, idx) => {
                if (item === "cta") return <CTACard key="cta" />;
                const pattern = item;
                const isLiked = liked.has(pattern.id);
                const isBookmarked = bookmarked.has(pattern.id);

                return (
                  <Link
                    key={pattern.id}
                    to={pattern.isSeed ? "/designer" : `/pattern/${pattern.slug}`}
                    className="break-inside-avoid mb-4 block group"
                  >
                    <div className="bg-card rounded-xl border border-border/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-12px_hsl(var(--explore-active)/0.25)]">
                      {/* Image area */}
                      <div className="relative bg-muted/30 p-4 flex justify-center">
                        <div
                          className="grid gap-px w-full"
                          style={{
                            gridTemplateColumns: `repeat(${pattern.grid_cols}, 1fr)`,
                            maxWidth: 300,
                            aspectRatio: `${pattern.grid_cols}/${pattern.grid_rows}`,
                          }}
                        >
                          {pattern.grid_data.flat().map((color, i) => (
                            <span
                              key={i}
                              className="rounded-[1px]"
                              style={{ backgroundColor: color === "transparent" ? "transparent" : color }}
                            />
                          ))}
                        </div>

                        {/* Featured badge */}
                        {pattern.isSeed && (
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-explore-active/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            <Sparkles size={10} /> Staff Pick
                          </span>
                        )}

                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 flex items-start justify-end p-3 gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => toggleLike(e, pattern.id)}
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-sm",
                              isLiked ? "bg-explore-active text-white" : "bg-card/90 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={(e) => toggleBookmark(e, pattern.id)}
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-sm",
                              isBookmarked ? "bg-explore-active text-white" : "bg-card/90 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-foreground leading-snug">{pattern.title}</h3>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                            {pattern.beadCount.toLocaleString()} beads
                          </span>
                          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", pattern.difficulty.color)}>
                            {pattern.difficulty.label}
                          </span>
                          {(likeCounts[pattern.id] || 0) > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                              <Heart size={12} className="text-explore-active" fill="currentColor" />
                              {likeCounts[pattern.id]}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                          {pattern.avatarUrl ? (
                            <img src={pattern.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <User size={12} className="text-muted-foreground" />
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground font-medium truncate">@{pattern.authorName}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-8">
              {loadingMore && (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              )}
              {!hasMore && patterns.length > 0 && (
                <p className="text-sm text-muted-foreground">You've seen all patterns ✨</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
