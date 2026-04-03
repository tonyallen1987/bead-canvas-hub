import { useState, useCallback } from "react";
import { Eraser, Download, Trash2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const PALETTE = [
  { name: "黑", hex: "#1a1a1a" },
  { name: "白", hex: "#F5F5F0" },
  { name: "红", hex: "#E84040" },
  { name: "粉", hex: "#E8708A" },
  { name: "珊瑚", hex: "#E88570" },
  { name: "橙", hex: "#E8A040" },
  { name: "柠檬", hex: "#E8D060" },
  { name: "绿", hex: "#6BC5A0" },
  { name: "薄荷", hex: "#88B890" },
  { name: "天蓝", hex: "#60B5E8" },
  { name: "蓝", hex: "#4080E8" },
  { name: "薰衣草", hex: "#A580D0" },
  { name: "桃", hex: "#E8B895" },
  { name: "灰", hex: "#A0A0A0" },
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

  const cellSize = Math.min(Math.floor(560 / size), 40);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold mb-2">拼豆编辑器</h1>
      <p className="text-muted-foreground mb-6">在网格上绘制你的拼豆图纸</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas */}
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
                  onMouseDown={() => {
                    setPainting(true);
                    paint(r, c);
                  }}
                  onMouseUp={() => setPainting(false)}
                  onMouseEnter={() => painting && paint(r, c)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    paint(r, c);
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="lg:w-64 space-y-5">
          {/* Size control */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              网格大小: {size} × {size}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => resizeGrid(size - 2)}
                className="p-2 rounded-lg border hover:bg-muted"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 h-2 bg-muted rounded-full relative">
                <div
                  className="absolute h-full bg-primary rounded-full"
                  style={{ width: `${((size - 4) / 28) * 100}%` }}
                />
              </div>
              <button
                onClick={() => resizeGrid(size + 2)}
                className="p-2 rounded-lg border hover:bg-muted"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Color palette */}
          <div>
            <label className="text-sm font-semibold mb-2 block">调色板</label>
            <div className="grid grid-cols-7 gap-1.5">
              {PALETTE.map((p) => (
                <button
                  key={p.hex}
                  title={p.name}
                  onClick={() => {
                    setColor(p.hex);
                    setIsEraser(false);
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg bead-dot transition-transform hover:scale-110",
                    color === p.hex && !isEraser && "ring-2 ring-foreground ring-offset-2 scale-110"
                  )}
                  style={{ backgroundColor: p.hex }}
                />
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors",
                isEraser && "bg-primary text-primary-foreground border-primary"
              )}
            >
              <Eraser size={16} />
              橡皮擦
            </button>
            <button
              onClick={clearGrid}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-destructive hover:text-primary-foreground transition-colors"
            >
              <Trash2 size={16} />
              清空
            </button>
          </div>

          <button
            onClick={exportPNG}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Download size={16} />
            导出 PNG
          </button>
        </div>
      </div>
    </div>
  );
}
