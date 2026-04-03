import { useState, useCallback } from "react";
import { Eraser, Download, Trash2, Plus, Minus, Save, Share2 } from "lucide-react";
import ImportFromImage from "@/components/designer/ImportFromImage";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

const EMPTY = "transparent";
const DEFAULT_SIZE = 16;

export default function Designer() {
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: DEFAULT_SIZE }, () => Array(DEFAULT_SIZE).fill(EMPTY))
  );
  const [color, setColor] = useState(PALETTE[0].hex);
  const [isEraser, setIsEraser] = useState(false);
  const [painting, setPainting] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const resizeGrid = (newSize: number) => {
    const clamped = Math.max(4, Math.min(32, newSize));
    setSize(clamped);
    setGrid(
      Array.from({ length: clamped }, (_, r) =>
        Array.from({ length: clamped }, (_, c) =>
          r < grid.length && c < (grid[0]?.length ?? 0) ? grid[r][c] : EMPTY
        )
      )
    );
  };

  const paint = useCallback(
    (r: number, c: number) => {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = isEraser ? EMPTY : color;
        return next;
      });
    },
    [color, isEraser]
  );

  const clearGrid = () =>
    setGrid(Array.from({ length: size }, () => Array(size).fill(EMPTY)));

  const handleImageImport = (importedGrid: string[][], rows: number, cols: number) => {
    setSize(Math.max(rows, cols));
    // Pad to square grid
    const maxDim = Math.max(rows, cols);
    const padded = Array.from({ length: maxDim }, (_, r) =>
      Array.from({ length: maxDim }, (_, c) =>
        r < rows && c < cols ? importedGrid[r][c] : EMPTY
      )
    );
    setGrid(padded);
  };

  const exportPNG = () => {
    const scale = 20;
    const canvas = document.createElement("canvas");
    canvas.width = size * scale;
    canvas.height = size * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#F5F5F0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    grid.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell !== EMPTY) {
          ctx.fillStyle = cell;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      })
    );
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "perlerly-pattern.png";
    a.click();
  };

  const savePattern = async (isPublic: boolean) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("perler_patterns").insert({
      user_id: user.id,
      title: title.trim(),
      grid_data: grid,
      grid_rows: size,
      grid_cols: size,
      is_public: isPublic,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error saving pattern", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isPublic ? "Pattern shared!" : "Pattern saved!" });
    }
  };

  const cellSize = Math.min(Math.floor(560 / size), 40);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold mb-2">Pattern Designer</h1>
      <p className="text-muted-foreground mb-6">Draw your bead pattern on the grid</p>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex justify-center">
          <div
            className="grid bg-muted/40 border rounded-xl p-2 select-none touch-none"
            style={{
              gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
              gap: 1,
            }}
            onMouseLeave={() => setPainting(false)}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <span
                  key={`${r}-${c}`}
                  className={cn(
                    "rounded-[2px] cursor-pointer transition-colors duration-75 hover:opacity-80",
                    cell === EMPTY && "bg-card border border-border/50"
                  )}
                  style={cell !== EMPTY ? { backgroundColor: cell } : undefined}
                  onMouseDown={() => { setPainting(true); paint(r, c); }}
                  onMouseUp={() => setPainting(false)}
                  onMouseEnter={() => painting && paint(r, c)}
                  onTouchStart={(e) => { e.preventDefault(); paint(r, c); }}
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:w-64 space-y-5">
          <div>
            <label className="text-sm font-semibold mb-2 block">Grid Size: {size} × {size}</label>
            <div className="flex items-center gap-2">
              <button onClick={() => resizeGrid(size - 2)} className="p-2 rounded-lg border hover:bg-muted">
                <Minus size={16} />
              </button>
              <div className="flex-1 h-2 bg-muted rounded-full relative">
                <div className="absolute h-full bg-primary rounded-full" style={{ width: `${((size - 4) / 28) * 100}%` }} />
              </div>
              <button onClick={() => resizeGrid(size + 2)} className="p-2 rounded-lg border hover:bg-muted">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Palette</label>
            <div className="grid grid-cols-7 gap-1.5">
              {PALETTE.map((p) => (
                <button
                  key={p.hex}
                  title={p.name}
                  onClick={() => { setColor(p.hex); setIsEraser(false); }}
                  className={cn(
                    "w-8 h-8 rounded-lg bead-dot transition-transform hover:scale-110",
                    color === p.hex && !isEraser && "ring-2 ring-foreground ring-offset-2 scale-110"
                  )}
                  style={{ backgroundColor: p.hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors",
                isEraser && "bg-primary text-primary-foreground border-primary"
              )}
            >
              <Eraser size={16} /> Eraser
            </button>
            <button
              onClick={clearGrid}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-destructive hover:text-primary-foreground transition-colors"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>

          <button
            onClick={exportPNG}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border font-bold text-sm hover:bg-muted transition-colors"
          >
            <Download size={16} /> Export PNG
          </button>

          {/* Save section */}
          <div className="border-t pt-4 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pattern title..."
              className="w-full px-3 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <button
                onClick={() => savePattern(false)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Save size={14} /> Save
              </button>
              <button
                onClick={() => savePattern(true)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
            {!user && (
              <p className="text-xs text-muted-foreground text-center">Sign in to save your patterns</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
