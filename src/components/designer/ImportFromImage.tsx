import { useRef } from "react";
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
import { useImageProcessor } from "@/hooks/useImageProcessor";
import ImageCropper from "./ImageCropper";
import ImageAdjustmentsPanel from "./ImageAdjustments";

interface ImportFromImageProps {
  onImport: (grid: string[][], rows: number, cols: number) => void;
  primary?: boolean;
}

export default function ImportFromImage({ onImport, primary }: ImportFromImageProps) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    preview,
    processedResult,
    adjustments,
    crop,
    gridSize,
    dithering,
    canvasRef,
    loadImage,
    updateGridSize,
    updateAdjustments,
    updateCrop,
    toggleDithering,
    reset,
  } = useImageProcessor();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleImport = () => {
    if (processedResult) {
      onImport(processedResult.grid, processedResult.rows, processedResult.cols);
      trackGeneratePattern("image_import", Math.max(processedResult.rows, processedResult.cols));
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
    if (fileRef.current) fileRef.current.value = "";
  };

  const cellSize = processedResult
    ? Math.min(Math.floor(320 / Math.max(processedResult.rows, processedResult.grid[0]?.length ?? 1)), 20)
    : 10;

  return (
    <>
      <Button
        variant={primary ? "default" : "outline"}
        onClick={() => setOpen(true)}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-colors",
          primary
            ? "bg-bead-pink text-white hover:bg-bead-pink/90 border-0 shadow-md"
            : "border-2 border-border hover:bg-muted"
        )}
      >
        <ImagePlus size={16} /> {primary ? "Upload Photo → Bead Pattern" : "Import from Image"}
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-extrabold">图片转拼豆</DialogTitle>
            <DialogDescription>
              上传图片，调整参数，转换为拼豆像素图案
            </DialogDescription>
          </DialogHeader>

          <canvas ref={canvasRef} className="hidden" />

          {!preview ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-8 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Upload size={32} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-semibold">
                点击或拖拽上传图片
              </span>
              <span className="text-xs text-muted-foreground">PNG, JPG, WEBP</span>
            </button>
          ) : (
            <div className="space-y-4">
              {/* Image preview with crop */}
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <ImageCropper src={preview} crop={crop} onCropChange={updateCrop} />
                </div>
                <button
                  onClick={() => {
                    reset();
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="p-1.5 rounded-lg border hover:bg-muted transition-colors shrink-0 mt-5"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Adjustments panel */}
              <ImageAdjustmentsPanel
                adjustments={adjustments}
                gridSize={gridSize}
                dithering={dithering}
                onAdjustmentChange={updateAdjustments}
                onGridSizeChange={updateGridSize}
                onDitheringChange={toggleDithering}
              />

              {/* Bead preview */}
              {processedResult && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    拼豆预览 ({processedResult.cols}×{processedResult.rows})
                  </p>
                  <div className="flex justify-center">
                    <div
                      className="grid bg-muted/40 border rounded-lg p-1"
                      style={{
                        gridTemplateColumns: `repeat(${processedResult.grid[0]?.length ?? 1}, ${cellSize}px)`,
                        gridTemplateRows: `repeat(${processedResult.rows}, ${cellSize}px)`,
                        gap: 1,
                      }}
                    >
                      {processedResult.grid.map((row, r) =>
                        row.map((cell, c) => (
                          <span
                            key={`${r}-${c}`}
                            className={cn(
                              "rounded-[1px]",
                              cell === "transparent" && "bg-card border border-border/50"
                            )}
                            style={cell !== "transparent" ? { backgroundColor: cell } : undefined}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />

          <div className="flex gap-2 pt-2">
            {preview && (
              <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
                换一张
              </Button>
            )}
            <Button onClick={handleImport} disabled={!processedResult} className="flex-1">
              <ImagePlus size={14} className="mr-1.5" />
              导入图案
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
