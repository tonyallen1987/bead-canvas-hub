import PageMeta from "@/components/PageMeta";
import { useState, useMemo } from "react";
import { Calculator, RotateCcw } from "lucide-react";

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

export default function Counter() {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(PALETTE.map((p) => [p.hex, 0]))
  );

  const total = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts]
  );

  const update = (hex: string, val: number) => {
    setCounts((prev) => ({ ...prev, [hex]: Math.max(0, val) }));
  };

  const reset = () =>
    setCounts(Object.fromEntries(PALETTE.map((p) => [p.hex, 0])));

  const activeColors = PALETTE.filter((p) => counts[p.hex] > 0);

  return (
    <div className="container py-8 max-w-2xl">
      <PageMeta title="Bead Counter – Perlerly" description="Count and tally your Perler beads by color. A simple tool to help you prepare before starting your next bead project." />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-bead-lemon flex items-center justify-center">
          <Calculator size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">Bead Counter</h1>
          <p className="text-muted-foreground text-sm">Enter quantities per color to calculate your bead needs</p>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-2xl border p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Beads</p>
            <p className="text-4xl font-extrabold">{total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Colors Used</p>
            <p className="text-4xl font-extrabold">{activeColors.length}</p>
          </div>
        </div>

        {activeColors.length > 0 && (
          <div className="flex gap-1 mt-4 h-6 rounded-lg overflow-hidden">
            {activeColors.map((p) => (
              <div
                key={p.hex}
                className="transition-all duration-300"
                style={{ backgroundColor: p.hex, flex: counts[p.hex] }}
                title={`${p.name}: ${counts[p.hex]}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PALETTE.map((p) => (
          <div key={p.hex} className="flex items-center gap-3 bg-card rounded-xl border px-4 py-3">
            <span className="w-8 h-8 rounded-lg bead-dot shrink-0" style={{ backgroundColor: p.hex }} />
            <span className="text-sm font-semibold flex-1">{p.name}</span>
            <input
              type="number"
              min={0}
              value={counts[p.hex] || ""}
              onChange={(e) => update(p.hex, parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-20 text-right px-3 py-1.5 rounded-lg border bg-muted/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-semibold text-sm hover:bg-muted transition-colors"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
