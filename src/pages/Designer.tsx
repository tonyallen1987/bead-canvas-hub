import PageMeta from "@/components/PageMeta";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Save, Share2, ChevronDown, ChevronUp, Palette, Settings2 } from "lucide-react";
import ImportFromImage from "@/components/designer/ImportFromImage";
import ShoppingList from "@/components/designer/ShoppingList";
import ColorSwapDialog from "@/components/designer/ColorSwapDialog";
import GridControls from "@/components/designer/GridControls";
import ToolBar, { type ToolMode } from "@/components/designer/ToolBar";
import ExportOptions from "@/components/designer/ExportOptions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { COLOR_GROUPS, PERLER_COLOR_MAP, PERLER_COLORS } from "@/data/perlerColors";
import { useIsMobile } from "@/hooks/use-mobile";

const EMPTY = "transparent";
const DEFAULT_SIZE = 16;
const MAX_UNDO = 50;

function makeGrid(size: number) {
  return Array.from({ length: size }, () => Array(size).fill(EMPTY));
}

export default function Designer() {
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [grid, setGrid] = useState<string[][]>(() => makeGrid(DEFAULT_SIZE));
  const [color, setColor] = useState(PERLER_COLORS.find(c => c.id === "red")?.hex ?? "#BE3128");
  const [tool, setTool] = useState<ToolMode>("paint");
  const [painting, setPainting] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(COLOR_GROUPS[0].label);
  const [swapHex, setSwapHex] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const isMobile = useIsMobile();

  // Mobile collapsible sections
  const [showPalette, setShowPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Undo/redo
  const undoStack = useRef<string[][][]>([]);
  const redoStack = useRef<string[][][]>([]);
  const [undoLen, setUndoLen] = useState(0);
  const [redoLen, setRedoLen] = useState(0);

  const pushUndo = useCallback((g: string[][]) => {
    undoStack.current.push(g.map((r) => [...r]));
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    redoStack.current = [];
    setUndoLen(undoStack.current.length);
    setRedoLen(0);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(grid.map((r) => [...r]));
    const prev = undoStack.current.pop()!;
    setGrid(prev);
    setSize(prev.length);
    setUndoLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
  }, [grid]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(grid.map((r) => [...r]));
    const next = redoStack.current.pop()!;
    setGrid(next);
    setSize(next.length);
    setUndoLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
  }, [grid]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const beadCount = useMemo(() => {
    let count = 0;
    for (const row of grid) for (const cell of row) if (cell !== EMPTY) count++;
    return count;
  }, [grid]);

  const handleSwapColor = (fromHex: string, toHex: string) => {
    pushUndo(grid);
    setGrid((prev) =>
      prev.map((row) => row.map((cell) => (cell === fromHex ? toHex : cell)))
    );
  };

  const resizeGrid = (newSize: number) => {
    const clamped = Math.max(4, Math.min(64, newSize));
    pushUndo(grid);
    setSize(clamped);
    setGrid(
      Array.from({ length: clamped }, (_, r) =>
        Array.from({ length: clamped }, (_, c) =>
          r < grid.length && c < (grid[0]?.length ?? 0) ? grid[r][c] : EMPTY
        )
      )
    );
  };

  const floodFill = useCallback((r: number, c: number, targetColor: string, replaceColor: string, g: string[][]) => {
    if (targetColor === replaceColor) return g;
    const rows = g.length;
    const cols = g[0].length;
    const filled = g.map((row) => [...row]);
    const stack: [number, number][] = [[r, c]];
    while (stack.length > 0) {
      const [cr, cc] = stack.pop()!;
      if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
      if (filled[cr][cc] !== targetColor) continue;
      filled[cr][cc] = replaceColor;
      stack.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
    }
    return filled;
  }, []);

  const paint = useCallback(
    (r: number, c: number, isFirst: boolean) => {
      if (tool === "fill" && isFirst) {
        setGrid((prev) => {
          pushUndo(prev);
          const target = prev[r][c];
          return floodFill(r, c, target, color, prev);
        });
        return;
      }
      if (isFirst) pushUndo(grid);
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = tool === "eraser" ? EMPTY : color;
        return next;
      });
    },
    [color, tool, pushUndo, floodFill, grid]
  );

  const clearGrid = () => {
    pushUndo(grid);
    setGrid(makeGrid(size));
  };

  const handleImageImport = (importedGrid: string[][], rows: number, cols: number) => {
    pushUndo(grid);
    const maxDim = Math.max(rows, cols);
    setSize(maxDim);
    const padded = Array.from({ length: maxDim }, (_, r) =>
      Array.from({ length: maxDim }, (_, c) =>
        r < rows && c < cols ? importedGrid[r][c] : EMPTY
      )
    );
    setGrid(padded);
  };

  const savePattern = async (isPublic: boolean) => {
    if (!user) { navigate("/auth"); return; }
    if (!title.trim()) { toast({ title: "Please enter a title", variant: "destructive" }); return; }
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

  // Responsive cell sizing: on mobile, fill screen width minus padding
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(360);

  useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const maxGridPx = isMobile ? containerWidth - 16 : 560;
  const baseCell = Math.min(Math.floor(maxGridPx / size), 40);
  const cellSize = Math.max(Math.round(baseCell * zoom), 4);

  return (
    <div className="container py-4 md:py-8 pb-20 md:pb-8">
      <PageMeta title="Photo to Perler Bead Pattern Converter – Perlerly" description="Upload any image and instantly convert it into a pixel art Perler bead pattern. Choose grid size, match official Perler colors, and download for free." />
      <h1 className="text-2xl md:text-3xl font-extrabold mb-1 md:mb-2">Photo to Perler Bead Pattern Converter</h1>
      <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">Upload any image and instantly get a pixel art bead pattern — or draw your own from scratch.</p>

      {/* Mobile: Import button at top */}
      {isMobile && (
        <div className="mb-3">
          <ImportFromImage onImport={handleImageImport} primary />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Grid canvas */}
        <div className="flex-1" ref={gridContainerRef}>
          {/* Mobile: current color indicator + compact toolbar */}
          {isMobile && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-7 h-7 rounded-full bead-dot shrink-0 border border-border/30"
                style={{ backgroundColor: color }}
              />
              {PERLER_COLOR_MAP.get(color) && (
                <span className="text-xs font-semibold truncate">{PERLER_COLOR_MAP.get(color)!.name}</span>
              )}
              <div className="ml-auto">
                <ToolBar
                  tool={tool}
                  onToolChange={setTool}
                  onClear={clearGrid}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={undoLen > 0}
                  canRedo={redoLen > 0}
                  zoom={zoom}
                  onZoomIn={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  onZoomOut={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                  compact={isMobile}
                />
              </div>
            </div>
          )}

          <div className="flex justify-center overflow-auto">
            <div
              className="grid bg-muted/40 border rounded-xl p-1 md:p-2 select-none touch-none"
              style={{
                gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
                gap: isMobile && size > 29 ? 0 : 1,
              }}
              onMouseLeave={() => setPainting(false)}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <span
                    key={`${r}-${c}`}
                    className={cn(
                      "rounded-[2px] cursor-pointer transition-colors duration-75 hover:opacity-80",
                      cell === EMPTY && "bg-card border border-border/50",
                      tool === "fill" && "cursor-crosshair"
                    )}
                    style={cell !== EMPTY ? { backgroundColor: cell } : undefined}
                    onMouseDown={() => { setPainting(true); paint(r, c, true); }}
                    onMouseUp={() => setPainting(false)}
                    onMouseEnter={() => painting && tool !== "fill" && paint(r, c, false)}
                    onTouchStart={(e) => { e.preventDefault(); paint(r, c, true); }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Mobile: collapsible palette */}
          {isMobile && (
            <div className="mt-3 space-y-2">
              {/* Palette toggle */}
              <button
                onClick={() => setShowPalette(!showPalette)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border bg-card text-sm font-bold"
              >
                <span className="flex items-center gap-2">
                  <Palette size={16} className="text-primary" />
                  Palette
                  <span className="flex gap-0.5 ml-1">
                    {COLOR_GROUPS.slice(0, 3).flatMap(g => g.colors.slice(0, 2)).map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: c.hex }} />
                    ))}
                  </span>
                </span>
                {showPalette ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showPalette && (
                <div className="space-y-1 max-h-[280px] overflow-y-auto">
                  {COLOR_GROUPS.map((group) => {
                    const isOpen = expandedGroup === group.label;
                    return (
                      <div key={group.label} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedGroup(isOpen ? null : group.label)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold hover:bg-muted/50 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="flex gap-0.5">
                              {group.colors.slice(0, 4).map((c) => (
                                <span key={c.id} className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.hex }} />
                              ))}
                            </span>
                            {group.label}
                          </span>
                          <span className="text-muted-foreground">{isOpen ? "−" : "+"}</span>
                        </button>
                        {isOpen && (
                          <div className="grid grid-cols-10 gap-1 p-2 pt-0">
                            {group.colors.map((p) => (
                              <button
                                key={p.id}
                                title={`${p.name} (${p.code})`}
                                onClick={() => { setColor(p.hex); setTool("paint"); setShowPalette(false); }}
                                className={cn(
                                  "w-7 h-7 rounded-lg bead-dot transition-transform hover:scale-110",
                                  color === p.hex && tool === "paint" && "ring-2 ring-foreground ring-offset-1 scale-110"
                                )}
                                style={{ backgroundColor: p.hex }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Settings toggle (grid size, export, save) */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border bg-card text-sm font-bold"
              >
                <span className="flex items-center gap-2">
                  <Settings2 size={16} className="text-primary" />
                  Settings & Export
                </span>
                {showSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showSettings && (
                <div className="space-y-4 p-1">
                  <GridControls size={size} beadCount={beadCount} onResize={resizeGrid} />
                  <ShoppingList grid={grid} onSwapColor={(hex) => setSwapHex(hex)} />
                  <ExportOptions grid={grid} size={size} title={title} isPaid={!!user} />

                  {/* Save / Share */}
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
              )}
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        {!isMobile && (
          <div className="lg:w-72 space-y-4">
            <ImportFromImage onImport={handleImageImport} primary />
            <GridControls size={size} beadCount={beadCount} onResize={resizeGrid} />

            {/* Palette */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Palette</label>
              <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
                {COLOR_GROUPS.map((group) => {
                  const isOpen = expandedGroup === group.label;
                  return (
                    <div key={group.label} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedGroup(isOpen ? null : group.label)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold hover:bg-muted/50 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="flex gap-0.5">
                            {group.colors.slice(0, 4).map((c) => (
                              <span key={c.id} className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.hex }} />
                            ))}
                          </span>
                          {group.label}
                        </span>
                        <span className="text-muted-foreground">{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen && (
                        <div className="grid grid-cols-8 gap-1 p-2 pt-0">
                          {group.colors.map((p) => (
                            <button
                              key={p.id}
                              title={`${p.name} (${p.code})`}
                              onClick={() => { setColor(p.hex); setTool("paint"); }}
                              className={cn(
                                "w-7 h-7 rounded-lg bead-dot transition-transform hover:scale-110",
                                color === p.hex && tool === "paint" && "ring-2 ring-foreground ring-offset-1 scale-110"
                              )}
                              style={{ backgroundColor: p.hex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {tool === "paint" && PERLER_COLOR_MAP.get(color) && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 border text-xs">
                <span className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: color }} />
                <span className="font-semibold">{PERLER_COLOR_MAP.get(color)!.name}</span>
                <span className="text-muted-foreground">{PERLER_COLOR_MAP.get(color)!.code}</span>
              </div>
            )}

            <ToolBar
              tool={tool}
              onToolChange={setTool}
              onClear={clearGrid}
              onUndo={undo}
              onRedo={redo}
              canUndo={undoLen > 0}
              canRedo={redoLen > 0}
              zoom={zoom}
              onZoomIn={() => setZoom((z) => Math.min(z + 0.25, 3))}
              onZoomOut={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
            />

            <ShoppingList grid={grid} onSwapColor={(hex) => setSwapHex(hex)} />
            <ExportOptions grid={grid} size={size} title={title} isPaid={!!user} />

            {/* Save / Share */}
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
        )}
      </div>

      {/* Static SEO content */}
      <section className="container py-12 md:py-16 border-t mt-8 md:mt-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">How to Use the Perler Bead Pattern Designer</h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8">
            Create your own custom Perler bead patterns in three steps: choose your grid size (16×16 for beginners, 29×29 for a standard pegboard, 32×32 or 58×58 for larger projects), select colors from the official Perler bead palette, and draw your pattern cell by cell. Use the Import from Image feature to automatically convert any PNG photo into a pixel art bead pattern.
          </p>
          <h3 className="text-lg md:text-xl font-bold mb-2">Grid Sizes Explained</h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            16×16 (Small): 256 beads, ideal for keychains and beginners. 29×29 (Standard): 841 beads, fits one standard Perler pegboard. 32×32 (Large): 1,024 beads. 58×58 (Double): 3,364 beads, requires four pegboards.
          </p>
        </div>
      </section>

      <ColorSwapDialog
        open={!!swapHex}
        fromHex={swapHex}
        onClose={() => setSwapHex(null)}
        onSwap={handleSwapColor}
      />
    </div>
  );
}
