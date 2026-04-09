import { useState, useRef, useCallback, useEffect } from "react";
import { CropRegion } from "@/hooks/useImageProcessor";
import { Crop } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  src: string;
  crop: CropRegion;
  onCropChange: (crop: CropRegion) => void;
}

export default function ImageCropper({ src, crop, onCropChange }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [tempCrop, setTempCrop] = useState<CropRegion | null>(null);
  const [cropping, setCropping] = useState(false);

  const getNormalized = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!cropping) return;
      e.preventDefault();
      const pos = getNormalized(e);
      setDragStart(pos);
      setDragging(true);
      setTempCrop({ x: pos.x, y: pos.y, w: 0, h: 0 });
    },
    [cropping, getNormalized]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !dragStart) return;
      const pos = getNormalized(e);
      const x = Math.min(dragStart.x, pos.x);
      const y = Math.min(dragStart.y, pos.y);
      const w = Math.abs(pos.x - dragStart.x);
      const h = Math.abs(pos.y - dragStart.y);
      setTempCrop({ x, y, w, h });
    },
    [dragging, dragStart, getNormalized]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragging || !tempCrop) return;
    setDragging(false);
    setDragStart(null);
    if (tempCrop.w > 0.02 && tempCrop.h > 0.02) {
      onCropChange(tempCrop);
      setCropping(false);
    }
    setTempCrop(null);
  }, [dragging, tempCrop, onCropChange]);

  const resetCrop = useCallback(() => {
    onCropChange({ x: 0, y: 0, w: 1, h: 1 });
    setCropping(false);
  }, [onCropChange]);

  const activeCrop = tempCrop || (crop.w < 1 || crop.h < 1 ? crop : null);
  const isFullCrop = crop.x === 0 && crop.y === 0 && crop.w === 1 && crop.h === 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-semibold">原图预览</p>
        <div className="flex gap-1">
          <Button
            variant={cropping ? "default" : "outline"}
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => setCropping(!cropping)}
          >
            <Crop size={12} className="mr-1" />
            {cropping ? "选择区域..." : "裁剪"}
          </Button>
          {!isFullCrop && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={resetCrop}
            >
              重置
            </Button>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative w-full max-h-40 overflow-hidden rounded-lg border cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (dragging) {
            setDragging(false);
            setDragStart(null);
            setTempCrop(null);
          }
        }}
      >
        <img src={src} alt="Source" className="w-full max-h-40 object-contain" draggable={false} />
        {/* Dim overlay outside crop */}
        {activeCrop && (
          <>
            <div
              className="absolute inset-0 bg-black/50 pointer-events-none"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${activeCrop.x * 100}% ${activeCrop.y * 100}%, ${activeCrop.x * 100}% ${(activeCrop.y + activeCrop.h) * 100}%, ${(activeCrop.x + activeCrop.w) * 100}% ${(activeCrop.y + activeCrop.h) * 100}%, ${(activeCrop.x + activeCrop.w) * 100}% ${activeCrop.y * 100}%, ${activeCrop.x * 100}% ${activeCrop.y * 100}%)`,
              }}
            />
            <div
              className="absolute border-2 border-primary pointer-events-none"
              style={{
                left: `${activeCrop.x * 100}%`,
                top: `${activeCrop.y * 100}%`,
                width: `${activeCrop.w * 100}%`,
                height: `${activeCrop.h * 100}%`,
              }}
            />
          </>
        )}
        {cropping && !dragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
              拖动选择裁剪区域
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
