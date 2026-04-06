import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Grid3X3, Palette, LayoutGrid } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { libraryPatterns, type LibraryPattern } from "@/data/libraryPatterns";
import { cn } from "@/lib/utils";

function getPegboards(rows: number, cols: number): number {
  return Math.ceil(rows / 29) * Math.ceil(cols / 29);
}

export default function LibraryPatternDetail() {
  const { id } = useParams<{ id: string }>();
  const pattern = libraryPatterns.find((p) => p.id === id);

  if (!pattern) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        <p className="text-lg font-semibold">Pattern not found</p>
        <Link to="/explore" className="text-primary underline mt-4 inline-block">Back to Explore</Link>
      </div>
    );
  }

  const pegboards = getPegboards(pattern.grid_rows, pattern.grid_cols);
  const gridLabel = `${pattern.grid_cols}×${pattern.grid_rows}`;
  const cellSize = Math.min(Math.floor(480 / Math.max(pattern.grid_cols, pattern.grid_rows)), 32);

  const pageTitle = `${pattern.title} – Free Perler Bead Pattern | Perlerly`;
  const pageDesc = `Free ${pattern.title} Perler bead pattern. ${gridLabel} grid, ${pattern.bead_count} beads, ${pattern.difficulty} difficulty. Download and print for free on Perlerly.`;
  const altText = `${pattern.title} Perler bead pattern – ${gridLabel} grid, ${pattern.bead_count} beads, ${pattern.difficulty} difficulty, ${pattern.category} category`;

  return (
    <div className="min-h-screen">
      <PageMeta title={pageTitle} description={pageDesc} />

      <div className="container py-8 max-w-4xl">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Back to Explore
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Pattern preview */}
          <div className="flex-1 flex justify-center">
            <div className="bg-muted/30 rounded-2xl border p-6 inline-block" role="img" aria-label={altText}>
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${pattern.grid_cols}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${pattern.grid_rows}, ${cellSize}px)`,
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
          </div>

          {/* Info sidebar */}
          <div className="lg:w-80 space-y-5">
            <div>
              <h1 className="text-2xl font-extrabold">{pattern.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-bead-sky/15 text-bead-sky uppercase tracking-wide">
                  {pattern.category}
                </span>
                <span className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full text-white",
                  pattern.difficulty === "Easy" ? "bg-explore-easy" : pattern.difficulty === "Medium" ? "bg-explore-medium" : "bg-explore-hard"
                )}>
                  {pattern.difficulty}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card rounded-2xl border p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Grid3X3 size={16} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Grid Size</span>
                <span className="ml-auto font-bold">{gridLabel}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Palette size={16} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Total Beads</span>
                <span className="ml-auto font-bold">{pattern.bead_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Palette size={16} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Colors Used</span>
                <span className="ml-auto font-bold">{pattern.colors_used}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="ml-auto font-bold">~{pattern.estimated_minutes} min</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <LayoutGrid size={16} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Pegboards Needed</span>
                <span className="ml-auto font-bold">{pegboards}</span>
              </div>
            </div>

            {/* Open in Designer CTA */}
            <Link
              to="/designer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Open in Designer
            </Link>
          </div>
        </div>

        {/* Static SEO content */}
        <section className="mt-16 border-t pt-12 max-w-3xl mx-auto space-y-8">
          <p className="text-muted-foreground text-base leading-relaxed">
            This {pattern.title} Perler bead pattern uses a {gridLabel} grid with {pattern.bead_count.toLocaleString()} beads across {pattern.colors_used} colors. It is rated {pattern.difficulty} difficulty and takes approximately {pattern.estimated_minutes} minutes to complete. You will need {pegboards} standard pegboard{pegboards > 1 ? "s" : ""} to assemble this pattern. It belongs to the {pattern.category} category.
          </p>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-4">How to Make This Pattern</h2>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-base leading-relaxed">
              <li><strong>Gather your supplies.</strong> You will need {pegboards} Perler pegboard{pegboards > 1 ? "s" : ""}, {pattern.bead_count.toLocaleString()} beads in {pattern.colors_used} colors, an iron, and ironing paper.</li>
              <li><strong>Set up your pegboard{pegboards > 1 ? "s" : ""}.</strong> {pegboards > 1 ? "Connect your pegboards into a larger surface to fit the full pattern." : "Place your pegboard on a flat surface."}</li>
              <li><strong>Place the beads.</strong> Follow the pattern grid above, placing beads one row at a time from top to bottom. Match each color carefully to the grid.</li>
              <li><strong>Iron the pattern.</strong> Cover the beads with ironing paper and press with a hot iron using medium heat. Move in slow circles for 10–20 seconds until the beads fuse together.</li>
              <li><strong>Cool and finish.</strong> Place a heavy book on top while the pattern cools to keep it flat. Once cool, carefully peel off the ironing paper.</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">Tips for Beginners</h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              Start by sorting your beads by color before placing them. Work in small sections to avoid knocking beads off the pegboard. If you make a mistake, use tweezers to carefully remove and replace individual beads. For best results, iron both sides of the pattern.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
