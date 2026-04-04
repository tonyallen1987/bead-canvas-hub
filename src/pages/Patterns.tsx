import PageMeta from "@/components/PageMeta";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, Palette, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  libraryPatterns,
  categories,
  difficulties,
  type Category,
  type Difficulty,
} from "@/data/libraryPatterns";

const difficultyColor: Record<Difficulty, string> = {
  Easy: "bg-explore-easy text-white",
  Medium: "bg-explore-medium text-white",
  Advanced: "bg-explore-hard text-white",
};

const categoryColor: Record<Exclude<Category, "All">, string> = {
  Gaming: "bg-bead-sky/15 text-bead-sky",
  Animals: "bg-bead-coral/15 text-bead-coral",
  Nature: "bg-bead-mint/15 text-bead-mint",
  Holidays: "bg-bead-lavender/15 text-bead-lavender",
  "Starter Kits": "bg-bead-lemon/15 text-accent-foreground",
};

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden animate-pulse">
      <div className="bg-muted/50 w-full" style={{ paddingBottom: "80%" }} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded-md w-3/4" />
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded-full w-14" />
          <div className="h-5 bg-muted rounded-full w-16" />
        </div>
        <div className="h-3 bg-muted rounded-md w-1/2" />
      </div>
    </div>
  );
}

export default function Patterns() {
  const [activeCat, setActiveCat] = useState<Category>("All");
  const [activeDiff, setActiveDiff] = useState<Difficulty | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return libraryPatterns.filter((p) => {
      if (activeCat !== "All" && p.category !== activeCat) return false;
      if (activeDiff !== "All" && p.difficulty !== activeDiff) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeCat, activeDiff, search]);

  return (
    <div className="min-h-screen grid-pattern">
      <PageMeta title="My Patterns – Perlerly" description="View and manage all your saved Perler bead patterns in one place." />
      <div className="container py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Pattern Library</h1>
          <p className="text-muted-foreground mt-1.5 text-base">
            Browse curated bead patterns by category &amp; difficulty
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patterns…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-explore-active/40"
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  activeCat === c
                    ? "bg-explore-active text-white shadow-sm"
                    : "bg-card border text-muted-foreground hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Difficulty chips */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveDiff("All")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeDiff === "All"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Any Difficulty
            </button>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDiff(d)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                  activeDiff === d
                    ? difficultyColor[d] + " shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No patterns here yet</p>
            <p className="text-sm mt-1 mb-4">Be the first to create one!</p>
            <Link
              to="/designer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-explore-active text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Open Designer <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Pattern grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((pattern) => (
              <Link
                key={pattern.id}
                to="/designer"
                className="group block"
              >
                <div className="bg-card rounded-xl border border-border/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-12px_hsl(var(--explore-active)/0.25)]">
                  {/* Preview */}
                  <div className="relative bg-muted/30 p-4 flex justify-center" role="img" aria-label={`${pattern.title} perler bead pattern – ${pattern.grid_cols}×${pattern.grid_rows} grid, ${pattern.difficulty} difficulty`}>
                    <div
                      className="grid gap-px w-full"
                      style={{
                        gridTemplateColumns: `repeat(${pattern.grid_cols}, 1fr)`,
                        maxWidth: 220,
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
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="font-bold text-foreground leading-snug">{pattern.title}</h3>

                    {/* Tags row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide", categoryColor[pattern.category as Exclude<Category, "All">])}>
                        {pattern.category}
                      </span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", difficultyColor[pattern.difficulty])}>
                        {pattern.difficulty}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Palette size={12} /> {pattern.bead_count} beads
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> ~{pattern.estimated_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
