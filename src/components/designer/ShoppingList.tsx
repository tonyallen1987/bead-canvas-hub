import { useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { PERLER_COLOR_MAP } from "@/data/perlerColors";

interface ShoppingListProps {
  grid: string[][];
  onSwapColor: (fromHex: string) => void;
}

export default function ShoppingList({ grid, onSwapColor }: ShoppingListProps) {
  const beadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of grid) {
      for (const cell of row) {
        if (cell !== "transparent") {
          counts.set(cell, (counts.get(cell) || 0) + 1);
        }
      }
    }
    // Sort by count descending
    return Array.from(counts.entries())
      .map(([hex, count]) => ({ hex, count, color: PERLER_COLOR_MAP.get(hex) }))
      .sort((a, b) => b.count - a.count);
  }, [grid]);

  const totalBeads = beadCounts.reduce((sum, b) => sum + b.count, 0);

  if (totalBeads === 0) return null;

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
        <ShoppingCart size={14} className="text-muted-foreground" />
        <span className="text-xs font-bold">Shopping List</span>
        <span className="ml-auto text-xs text-muted-foreground font-semibold">
          {totalBeads.toLocaleString()} beads · {beadCounts.length} colors
        </span>
      </div>
      <div className="max-h-[220px] overflow-y-auto">
        {beadCounts.map(({ hex, count, color }) => (
          <button
            key={hex}
            onClick={() => onSwapColor(hex)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors border-b last:border-b-0"
            title="Click to swap this color"
          >
            <span
              className="w-5 h-5 rounded shrink-0 border border-border/40"
              style={{ backgroundColor: hex }}
            />
            <span className="flex-1 text-left truncate font-medium">
              {color ? `${color.name}` : hex}
            </span>
            <span className="text-muted-foreground font-mono shrink-0">
              {color?.code}
            </span>
            <span className="font-bold tabular-nums shrink-0 w-10 text-right">
              ×{count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
