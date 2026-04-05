import { cn } from "@/lib/utils";
import { Grid3X3 } from "lucide-react";

const PRESETS = [
  { label: "16×16", size: 16, desc: "Small" },
  { label: "29×29", size: 29, desc: "Standard pegboard" },
  { label: "32×32", size: 32, desc: "Large" },
  { label: "58×58", size: 58, desc: "Double pegboard" },
] as const;

const PEGBOARD_SIZE = 29; // standard Perler pegboard is 29×29

interface GridControlsProps {
  size: number;
  beadCount: number;
  onResize: (newSize: number) => void;
}

export default function GridControls({ size, beadCount, onResize }: GridControlsProps) {
  const estimatedMinutes = Math.round(beadCount * 0.15 + 5);
  const hours = Math.floor(estimatedMinutes / 60);
  const mins = estimatedMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const pegboardsPerSide = Math.ceil(size / PEGBOARD_SIZE);
  const pegboardsNeeded = pegboardsPerSide * pegboardsPerSide;

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold mb-1 block">Grid Size</label>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.size}
            onClick={() => onResize(p.size)}
            className={cn(
              "px-2.5 py-2 rounded-lg border text-xs font-semibold transition-colors text-left",
              size === p.size
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            <span className="block font-bold">{p.label}</span>
            <span className="text-[10px] opacity-75">{p.desc}</span>
          </button>
        ))}
      </div>

      {/* Custom size */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Custom:</span>
        <input
          type="number"
          min={4}
          max={64}
          value={size}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (v && v >= 4 && v <= 64) onResize(v);
          }}
          className="w-16 px-2 py-1 rounded-lg border bg-card text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <span className="text-xs font-mono">{size}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[10px] text-muted-foreground font-medium">Beads</p>
          <p className="text-sm font-bold tabular-nums">{beadCount.toLocaleString()}</p>
        </div>
        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[10px] text-muted-foreground font-medium">Est. Time</p>
          <p className="text-sm font-bold">{beadCount > 0 ? timeStr : "—"}</p>
        </div>
        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center flex flex-col items-center">
          <p className="text-[10px] text-muted-foreground font-medium">Pegboards</p>
          <div className="flex items-center gap-1">
            <Grid3X3 size={10} className="text-muted-foreground" />
            <p className="text-sm font-bold">{pegboardsNeeded}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
