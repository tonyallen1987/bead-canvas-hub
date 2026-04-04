import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ImageIcon, Loader2, CheckCircle2, XCircle, ShieldAlert, Eye, Tag } from "lucide-react";
import { toast } from "sonner";
import type { ExploreCategory } from "@/data/seedPatterns";

const IMPORT_CATEGORIES: ExploreCategory[] = ["Animals", "Food", "Games", "Nature", "Sports", "Holidays", "Letters", "Abstract"];

// --- Perler palette for client-side preview ---
const PERLER_COLORS = [
  { hex: "#000000", r: 0, g: 0, b: 0 }, { hex: "#FFFFFF", r: 255, g: 255, b: 255 },
  { hex: "#95A5A6", r: 149, g: 165, b: 166 }, { hex: "#7F8C8D", r: 127, g: 140, b: 141 },
  { hex: "#BE3128", r: 190, g: 49, b: 40 }, { hex: "#922B21", r: 146, g: 43, b: 33 },
  { hex: "#7B241C", r: 123, g: 36, b: 28 }, { hex: "#FF7F50", r: 255, g: 127, b: 80 },
  { hex: "#F39C12", r: 243, g: 156, b: 18 }, { hex: "#F1C40F", r: 241, g: 196, b: 15 },
  { hex: "#F4D03F", r: 244, g: 208, b: 63 }, { hex: "#FCF3CF", r: 252, g: 243, b: 207 },
  { hex: "#A2D149", r: 162, g: 209, b: 73 }, { hex: "#2ECC71", r: 46, g: 204, b: 113 },
  { hex: "#1D8348", r: 29, g: 131, b: 72 }, { hex: "#27AE60", r: 39, g: 174, b: 96 },
  { hex: "#AED6F1", r: 174, g: 214, b: 241 }, { hex: "#2E86C1", r: 46, g: 134, b: 193 },
  { hex: "#1F618D", r: 31, g: 97, b: 141 }, { hex: "#85C1E9", r: 133, g: 193, b: 233 },
  { hex: "#8E44AD", r: 142, g: 68, b: 173 }, { hex: "#6C3483", r: 108, g: 52, b: 131 },
  { hex: "#FADBD8", r: 250, g: 219, b: 216 }, { hex: "#F1948A", r: 241, g: 148, b: 138 },
  { hex: "#D2B48C", r: 210, g: 180, b: 140 }, { hex: "#A04000", r: 160, g: 64, b: 0 },
  { hex: "#6E2C00", r: 110, g: 44, b: 0 }, { hex: "#BA4A00", r: 186, g: 74, b: 0 },
  { hex: "#EDBB99", r: 237, g: 187, b: 153 }, { hex: "#FFDAB9", r: 255, g: 218, b: 185 },
  { hex: "#FFB6C1", r: 255, g: 182, b: 193 }, { hex: "#D7BDE2", r: 215, g: 189, b: 226 },
  { hex: "#D1F2EB", r: 209, g: 242, b: 235 }, { hex: "#A9CCE3", r: 169, g: 204, b: 227 },
  { hex: "#81D4FA", r: 129, g: 212, b: 250 }, { hex: "#48C9B0", r: 72, g: 201, b: 176 },
  { hex: "#16A085", r: 22, g: 160, b: 133 }, { hex: "#808000", r: 128, g: 128, b: 0 },
  { hex: "#D4AC0D", r: 212, g: 172, b: 13 }, { hex: "#E67E22", r: 230, g: 126, b: 34 },
  { hex: "#CA6F1E", r: 202, g: 111, b: 30 }, { hex: "#1B2631", r: 27, g: 38, b: 49 },
  { hex: "#7D3C98", r: 125, g: 60, b: 152 }, { hex: "#C0392B", r: 192, g: 57, b: 43 },
  { hex: "#F5B041", r: 245, g: 176, b: 65 }, { hex: "#F39C12", r: 243, g: 156, b: 18 },
  { hex: "#ABB2B9", r: 171, g: 178, b: 185 }, { hex: "#5DADE2", r: 93, g: 173, b: 226 },
];

function nearestPerlerColor(r: number, g: number, b: number): string {
  let best = PERLER_COLORS[0];
  let bestDist = Infinity;
  const srcL = 0.299 * r + 0.587 * g + 0.114 * b;
  for (const c of PERLER_COLORS) {
    const cL = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    const dL = srcL - cL;
    const dr = r - c.r;
    const dg = g - c.g;
    const db = b - c.b;
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db + 3 * dL * dL;
    if (dist < bestDist) { bestDist = dist; best = c; }
  }
  return best.hex;
}

interface FileEntry {
  file: File;
  preview: string;
  pixelPreview?: string[][]; // 32x32 grid of hex colors
}

interface LogEntry {
  title: string;
  success: boolean;
  error?: string;
}

const BATCH_SIZE = 5;

/** Generate a 32x32 pixel preview from an image file */
function generatePixelPreview(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); return reject(new Error("Canvas not supported")); }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, 32, 32);
      URL.revokeObjectURL(url);

      const imageData = ctx.getImageData(0, 0, 32, 32);
      const grid: string[][] = [];
      for (let y = 0; y < 32; y++) {
        const row: string[] = [];
        for (let x = 0; x < 32; x++) {
          const i = (y * 32 + x) * 4;
          const a = imageData.data[i + 3];
          if (a < 128) {
            row.push("transparent");
          } else {
            row.push(nearestPerlerColor(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]));
          }
        }
        grid.push(row);
      }
      resolve(grid);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not load image")); };
    img.src = url;
  });
}

function PixelPreviewGrid({ grid }: { grid: string[][] }) {
  return (
    <div
      className="grid w-full aspect-square"
      style={{ gridTemplateColumns: "repeat(32, 1fr)" }}
    >
      {grid.flat().map((color, i) => (
        <span
          key={i}
          style={{ backgroundColor: color === "transparent" ? "transparent" : color }}
        />
      ))}
    </div>
  );
}

export default function AdminImport() {
  const { isAdmin, checking, user } = useAdminCheck();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!checking && !user) navigate("/auth");
  }, [checking, user, navigate]);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    if (imageFiles.length === 0) {
      toast.error("No supported image files found. Please use PNG, JPG, or WebP.");
      return;
    }
    const entries: FileEntry[] = [];
    for (const file of imageFiles) {
      try {
        const pixelPreview = await generatePixelPreview(file);
        entries.push({ file, preview: URL.createObjectURL(file), pixelPreview });
      } catch {
        entries.push({ file, preview: URL.createObjectURL(file) });
        toast.error(`Could not generate preview for ${file.name}`);
      }
    }
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      if (previewIndex === index) setPreviewIndex(null);
      else if (previewIndex !== null && previewIndex > index) setPreviewIndex(previewIndex - 1);
      return prev.filter((_, i) => i !== index);
    });
  };

  /** Convert any image file to a PNG base64 data URL via canvas */
  const fileToPngBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); return reject(new Error("Canvas not supported")); }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Could not decode image: ${file.name}`));
      };
      img.src = url;
    });

  const handleImport = async () => {
    if (files.length === 0) return;
    setImporting(true);
    setProgress(0);
    setTotal(files.length);
    setLogs([]);

    let completed = 0;

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const images: { filename: string; base64: string }[] = [];
      for (const entry of batch) {
        try {
          const base64 = await fileToPngBase64(entry.file);
          images.push({ filename: entry.file.name, base64 });
        } catch (e) {
          setLogs((prev) => [
            ...prev,
            {
              title: entry.file.name,
              success: false,
              error: e instanceof Error ? e.message : "Failed to convert image to PNG",
            },
          ]);
          completed++;
          setProgress(completed);
        }
      }
      if (images.length === 0) continue;

      try {
        const { data, error } = await supabase.functions.invoke(
          "bulk-import-patterns",
          { body: { images } }
        );

        if (error) {
          batch.forEach((entry) =>
            setLogs((prev) => [
              ...prev,
              { title: entry.file.name, success: false, error: error.message },
            ])
          );
        } else if (data?.results) {
          setLogs((prev) => [...prev, ...data.results]);
        }
      } catch (e) {
        batch.forEach((entry) =>
          setLogs((prev) => [
            ...prev,
            {
              title: entry.file.name,
              success: false,
              error: e instanceof Error ? e.message : "Network error",
            },
          ])
        );
      }

      completed += batch.length;
      setProgress(completed);
    }

    setImporting(false);
    toast.success(`Import complete!`);
    setFiles([]);
    setPreviewIndex(null);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  if (checking) return null;

  // Access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              This page is restricted to administrators. If you believe this is an error, please contact the site owner.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activePreview = previewIndex !== null ? files[previewIndex] : null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> Bulk Pattern Import
            </CardTitle>
            <CardDescription>
              Drag and drop images to convert them into 32×32 Perler bead
              patterns automatically. All formats (PNG, JPG, WebP) are converted client-side.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop images here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                PNG, JPG, WEBP supported — auto-converted to PNG
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {/* File list + preview side by side */}
            {files.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {files.length} file{files.length !== 1 && "s"} selected
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {files.map((entry, i) => (
                      <div
                        key={i}
                        className={`group relative overflow-hidden rounded-md border cursor-pointer transition-all ${
                          previewIndex === i ? "ring-2 ring-primary border-primary" : "bg-muted hover:border-primary/50"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewIndex(previewIndex === i ? null : i);
                        }}
                      >
                        <img
                          src={entry.preview}
                          alt={entry.file.name}
                          className="aspect-square w-full object-cover"
                        />
                        {entry.pixelPreview && (
                          <div className="absolute bottom-0 right-0 p-0.5">
                            <Eye className="h-3 w-3 text-foreground/70 bg-background/70 rounded-sm" />
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <p className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">
                          {entry.file.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full"
                    size="lg"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing…
                      </>
                    ) : (
                      `Start Bulk Import (${files.length} images)`
                    )}
                  </Button>
                </div>

                {/* Pixel preview panel */}
                {activePreview?.pixelPreview && (
                  <div className="w-full md:w-56 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Bead Preview</p>
                    <div className="rounded-lg border bg-muted/30 p-2">
                      <PixelPreviewGrid grid={activePreview.pixelPreview} />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center truncate">
                      {activePreview.file.name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Progress */}
            {(importing || logs.length > 0) && total > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {progress} / {total}
                  </span>
                </div>
                <Progress value={(progress / total) * 100} />
              </div>
            )}

            {/* Log area */}
            {logs.length > 0 && (
              <ScrollArea className="h-48 rounded-md border p-3">
                <div className="space-y-1">
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm"
                    >
                      {log.success ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <span className="truncate">{log.title}</span>
                      {log.error && (
                        <span className="ml-auto text-xs text-destructive">
                          {log.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
