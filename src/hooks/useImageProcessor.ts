import { useState, useRef, useCallback } from "react";
import { nearestPerlerColor, PERLER_COLORS } from "@/data/perlerColors";

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
}

export interface CropRegion {
  x: number; // 0-1 normalized
  y: number;
  w: number;
  h: number;
}

export interface ProcessedResult {
  grid: string[][];
  rows: number;
  cols: number;
}

const DEFAULT_ADJUSTMENTS: ImageAdjustments = { brightness: 0, contrast: 0, saturation: 0 };
const DEFAULT_CROP: CropRegion = { x: 0, y: 0, w: 1, h: 1 };

/**
 * Floyd-Steinberg dithering: distributes quantisation error to neighbouring pixels.
 */
function floydSteinbergDither(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): void {
  // Work on a float copy so errors can go negative
  const buf = new Float32Array(pixels.length);
  for (let i = 0; i < pixels.length; i++) buf[i] = pixels[i];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (buf[i + 3] < 128) continue; // transparent

      const oldR = buf[i], oldG = buf[i + 1], oldB = buf[i + 2];

      // Find nearest Perler color
      const hex = nearestPerlerColor(
        Math.max(0, Math.min(255, Math.round(oldR))),
        Math.max(0, Math.min(255, Math.round(oldG))),
        Math.max(0, Math.min(255, Math.round(oldB)))
      );
      const pc = PERLER_COLORS.find((c) => c.hex === hex)!;

      buf[i] = pc.r;
      buf[i + 1] = pc.g;
      buf[i + 2] = pc.b;

      const errR = oldR - pc.r;
      const errG = oldG - pc.g;
      const errB = oldB - pc.b;

      const spread = (dx: number, dy: number, factor: number) => {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < width && ny < height) {
          const j = (ny * width + nx) * 4;
          buf[j] += errR * factor;
          buf[j + 1] += errG * factor;
          buf[j + 2] += errB * factor;
        }
      };

      spread(1, 0, 7 / 16);
      spread(-1, 1, 3 / 16);
      spread(0, 1, 5 / 16);
      spread(1, 1, 1 / 16);
    }
  }

  // Write back
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.max(0, Math.min(255, Math.round(buf[i])));
  }
}

export function useImageProcessor() {
  const [preview, setPreview] = useState<string | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessedResult | null>(null);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [crop, setCrop] = useState<CropRegion>(DEFAULT_CROP);
  const [gridSize, setGridSize] = useState(24);
  const [dithering, setDithering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const buildGrid = useCallback(
    (img: HTMLImageElement, size: number, adj: ImageAdjustments, cropR: CropRegion, useDither: boolean) => {
      // Compute crop pixel coords
      const sx = Math.round(cropR.x * img.width);
      const sy = Math.round(cropR.y * img.height);
      const sw = Math.max(1, Math.round(cropR.w * img.width));
      const sh = Math.max(1, Math.round(cropR.h * img.height));

      const aspect = sw / sh;
      let cols: number, rows: number;
      if (aspect >= 1) {
        cols = size;
        rows = Math.max(1, Math.round(size / aspect));
      } else {
        rows = size;
        cols = Math.max(1, Math.round(size * aspect));
      }

      const canvas = canvasRef.current!;
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext("2d")!;

      // Apply brightness/contrast/saturation via CSS filter on canvas
      const b = 1 + adj.brightness / 100;
      const c = 1 + adj.contrast / 100;
      const s = 1 + adj.saturation / 100;
      ctx.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      ctx.filter = "none";

      const imageData = ctx.getImageData(0, 0, cols, rows);

      if (useDither) {
        floydSteinbergDither(imageData.data, cols, rows);
        // After dithering, pixels are already matched; read hex from nearest
        const grid: string[][] = [];
        for (let r = 0; r < rows; r++) {
          const row: string[] = [];
          for (let cc = 0; cc < cols; cc++) {
            const i = (r * cols + cc) * 4;
            if (imageData.data[i + 3] < 128) {
              row.push("transparent");
            } else {
              // Already quantised by dither, but re-match to be safe
              row.push(nearestPerlerColor(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]));
            }
          }
          grid.push(row);
        }
        setProcessedResult({ grid, rows, cols });
      } else {
        const grid: string[][] = [];
        for (let r = 0; r < rows; r++) {
          const row: string[] = [];
          for (let cc = 0; cc < cols; cc++) {
            const i = (r * cols + cc) * 4;
            if (imageData.data[i + 3] < 128) {
              row.push("transparent");
            } else {
              row.push(nearestPerlerColor(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]));
            }
          }
          grid.push(row);
        }
        setProcessedResult({ grid, rows, cols });
      }
    },
    []
  );

  const reprocess = useCallback(() => {
    const img = sourceImageRef.current;
    if (img) buildGrid(img, gridSize, adjustments, crop, dithering);
  }, [buildGrid, gridSize, adjustments, crop, dithering]);

  const loadImage = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        setCrop(DEFAULT_CROP);
        setAdjustments(DEFAULT_ADJUSTMENTS);
        const img = new Image();
        img.onload = () => {
          sourceImageRef.current = img;
          buildGrid(img, gridSize, DEFAULT_ADJUSTMENTS, DEFAULT_CROP, dithering);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [buildGrid, gridSize, dithering]
  );

  const updateGridSize = useCallback(
    (size: number) => {
      setGridSize(size);
      const img = sourceImageRef.current;
      if (img) buildGrid(img, size, adjustments, crop, dithering);
    },
    [buildGrid, adjustments, crop, dithering]
  );

  const updateAdjustments = useCallback(
    (adj: Partial<ImageAdjustments>) => {
      setAdjustments((prev) => {
        const next = { ...prev, ...adj };
        const img = sourceImageRef.current;
        if (img) buildGrid(img, gridSize, next, crop, dithering);
        return next;
      });
    },
    [buildGrid, gridSize, crop, dithering]
  );

  const updateCrop = useCallback(
    (c: CropRegion) => {
      setCrop(c);
      const img = sourceImageRef.current;
      if (img) buildGrid(img, gridSize, adjustments, c, dithering);
    },
    [buildGrid, gridSize, adjustments, dithering]
  );

  const toggleDithering = useCallback(
    (enabled: boolean) => {
      setDithering(enabled);
      const img = sourceImageRef.current;
      if (img) buildGrid(img, gridSize, adjustments, crop, enabled);
    },
    [buildGrid, gridSize, adjustments, crop]
  );

  const reset = useCallback(() => {
    setPreview(null);
    setProcessedResult(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setCrop(DEFAULT_CROP);
    sourceImageRef.current = null;
  }, []);

  return {
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
    reprocess,
  };
}
