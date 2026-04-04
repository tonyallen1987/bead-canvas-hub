import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, X, ImageIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface FileEntry {
  file: File;
  preview: string;
}

interface LogEntry {
  title: string;
  success: boolean;
  error?: string;
}

const BATCH_SIZE = 5;

export default function AdminImport() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    const entries = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
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
        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error("Canvas not supported"));
        }
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
      const images = await Promise.all(
        batch.map(async (entry) => ({
          filename: entry.file.name,
          base64: await fileToBase64(entry.file),
        }))
      );

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
    const successCount = logs.length; // will be updated by final state
    toast.success(`Import complete!`);
    setFiles([]);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> Bulk Pattern Import
            </CardTitle>
            <CardDescription>
              Drag and drop images to convert them into 32×32 Perler bead
              patterns automatically.
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
                PNG, JPG, WEBP supported
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {files.length} file{files.length !== 1 && "s"} selected
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {files.map((entry, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-md border bg-muted"
                    >
                      <img
                        src={entry.preview}
                        alt={entry.file.name}
                        className="aspect-square w-full object-cover"
                      />
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
