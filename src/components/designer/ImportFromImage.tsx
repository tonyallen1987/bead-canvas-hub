import { useState, useRef, useCallback } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackGeneratePattern } from "@/lib/analytics";

// Extended Perler bead palette with RGB values for color matching
const PERLER_COLORS = [
  { name: "Black", hex: "#1a1a1a", r: 26, g: 26, b: 26 },
  { name: "White", hex: "#F5F5F0", r: 245, g: 245, b: 240 },
  { name: "Red", hex: "#E84040", r: 232, g: 64, b: 64 },
  { name: "Pink", hex: "#E8708A", r: 232, g: 112, b: 138 },
  { name: "Coral", hex: "#E88570", r: 232, g: 133, b: 112 },
  { name: "Orange", hex: "#E8A040", r: 232, g: 160, b: 64 },
  { name: "Lemon", hex: "#E8D060", r: 232, g: 208, b: 96 },
  { name: "Mint", hex: "#6BC5A0", r: 107, g: 197, b: 160 },
  { name: "Sage", hex: "#88B890", r: 136, g: 184, b: 144 },
  { name: "Sky", hex: "#60B5E8", r: 96, g: 181, b: 232 },
  { name: "Blue", hex: "#4080E8", r: 64, g: 128, b: 232 },
  { name: "Lavender", hex: "#A580D0", r: 165, g: 128, b: 208 },
  { name: "Peach", hex: "#E8B895", r: 232, g: 184, b: 149 },
  { name: "Gray", hex: "#A0A0A0", r: 160, g: 160, b: 160 },
];

const GRID_SIZES = [16, 24, 32, 48] as const;

function nearestPerlerColor(r: number, g: number, b: number) {
  let best = PERLER_COLORS[0];
  let bestDist = Infinity;
  for (const c of PERLER_COLORS) {
    const dr = r - c.r;
    const dg = g - c.g;
    const db = b - c.b;
    // Weighted Euclidean distance (human perception)
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best.hex;
}

interface ImportFromImageProps {
  onImport: (grid: string[][], rows: number, cols: number) => void;
}

export default function ImportFromImage({ onImport }: ImportFromImageProps) {
  const [open, setOpen] = useState(false);
  const [gridSize, setGridSize] = useState<number>(16);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedGrid, setProcessedGrid] = useState<string[][] | null>(null);
  const [imgDims, setImgDims] = useState<{ rows: number; cols: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(
    (file: File, size: number) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);

        const img = new Image();
        img.onload = () => {
          // Compute grid dimensions preserving aspect ratio
          const aspect = img.width / img.height;
          let cols: number, rows: number;
          if (aspect >= 1) {
            cols = size;
            rows = Math.max(1, Math.round(size / aspect));
          } else {
            rows = size;
            cols = Math.max(1, Math.round(size * aspect));
          }

          // Draw downsampled image using nearest-neighbor
          const canvas = canvasRef.current!;
          canvas.width = cols;
          canvas.height = rows;
          const ctx = canvas.getContext("2d")!;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, cols, rows);

          const imageData = ctx.getImageData(0, 0, cols, rows);
          const grid: string[][] = [];
          for (let r = 0; r < rows; r++) {
            const row: string[] = [];
            for (let c = 0; c < cols; c++) {
              const i = (r * cols + c) * 4;
              const alpha = imageData.data[i + 3];
              if (alpha < 128) {
                row.push("transparent");
              } else {
                row.push(
                  nearestPerlerColor(
                    imageData.data[i],
                    imageData.data[i + 1],
                    imageData.data[i + 2]
                  )
                );
              }
            }
            grid.push(row);
          }

          setProcessedGrid(grid);
          setImgDims({ rows, cols });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file, gridSize);
  };

  const handleSizeChange = (newSize: number) => {
    setGridSize(newSize);
    // Re-process if we already have a preview
    if (preview) {
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        let cols: number, rows: number;
        if (aspect >= 1) {
          cols = newSize;
          rows = Math.max(1, Math.round(newSize / aspect));
        } else {
          rows = newSize;
          cols = Math.max(1, Math.round(newSize * aspect));
        }

        const canvas = canvasRef.current!;
        canvas.width = cols;
        canvas.height = rows;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, cols, rows);

        const imageData = ctx.getImageData(0, 0, cols, rows);
        const grid: string[][] = [];
        for (let r = 0; r < rows; r++) {
          const row: string[] = [];
          for (let c = 0; c < cols; c++) {
            const i = (r * cols + c) * 4;
            const alpha = imageData.data[i + 3];
            if (alpha < 128) {
              row.push("transparent");
            } else {
              row.push(
                nearestPerlerColor(
                  imageData.data[i],
                  imageData.data[i + 1],
                  imageData.data[i + 2]
                )
              );
            }
          }
          grid.push(row);
        }
        setProcessedGrid(grid);
        setImgDims({ rows, cols });
      };
      img.src = preview;
    }
  };

  const handleImport = () => {
    if (processedGrid && imgDims) {
      onImport(processedGrid, imgDims.rows, imgDims.cols);
      setOpen(false);
      setPreview(null);
      setProcessedGrid(null);
      setImgDims(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPreview(null);
    setProcessedGrid(null);
    setImgDims(null);
  };

  const cellSize = processedGrid
    ? Math.min(Math.floor(320 / Math.max(processedGrid.length, processedGrid[0]?.length ?? 1)), 20)
    : 10;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border font-bold text-sm hover:bg-muted transition-colors"
      >
        <ImagePlus size={16} /> Import from Image
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-extrabold">Import from Image</DialogTitle>
            <DialogDescription>
              Upload a photo and convert it into a bead pattern
            </DialogDescription>
          </DialogHeader>

          <canvas ref={canvasRef} className="hidden" />

          {/* Grid size selector */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Grid Size</label>
            <div className="flex gap-2">
              {GRID_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSizeChange(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors",
                    gridSize === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  )}
                >
                  {s}×{s}
                </button>
              ))}
            </div>
          </div>

          {/* Upload area */}
          {!preview ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-8 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Upload size={32} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-semibold">
                Click to upload an image
              </span>
              <span className="text-xs text-muted-foreground">PNG, JPG, or WEBP</span>
            </button>
          ) : (
            <div className="space-y-4">
              {/* Source preview */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Original</p>
                  <img
                    src={preview}
                    alt="Source"
                    className="w-full max-h-32 object-contain rounded-lg border"
                  />
                </div>
                <button
                  onClick={() => {
                    setPreview(null);
                    setProcessedGrid(null);
                    setImgDims(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="p-1.5 rounded-lg border hover:bg-muted transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Bead preview */}
              {processedGrid && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    Bead Preview ({imgDims?.cols}×{imgDims?.rows})
                  </p>
                  <div className="flex justify-center">
                    <div
                      className="grid bg-muted/40 border rounded-lg p-1"
                      style={{
                        gridTemplateColumns: `repeat(${processedGrid[0]?.length ?? 1}, ${cellSize}px)`,
                        gridTemplateRows: `repeat(${processedGrid.length}, ${cellSize}px)`,
                        gap: 1,
                      }}
                    >
                      {processedGrid.map((row, r) =>
                        row.map((cell, c) => (
                          <span
                            key={`${r}-${c}`}
                            className={cn(
                              "rounded-[1px]",
                              cell === "transparent" && "bg-card border border-border/50"
                            )}
                            style={
                              cell !== "transparent"
                                ? { backgroundColor: cell }
                                : undefined
                            }
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {preview && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileRef.current?.click()}
              >
                Choose Different
              </Button>
            )}
            <Button
              onClick={handleImport}
              disabled={!processedGrid}
              className="flex-1"
            >
              <ImagePlus size={14} className="mr-1.5" />
              Import Pattern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
