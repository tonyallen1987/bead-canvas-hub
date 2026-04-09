import { cn } from "@/lib/utils";
import { Eraser, Trash2, PaintBucket, Undo2, Redo2, ZoomIn, ZoomOut } from "lucide-react";

export type ToolMode = "paint" | "eraser" | "fill";

interface ToolBarProps {
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  compact?: boolean;
}

export default function ToolBar({
  tool, onToolChange, onClear,
  onUndo, onRedo, canUndo, canRedo,
  zoom, onZoomIn, onZoomOut,
  compact,
}: ToolBarProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => onToolChange(tool === "eraser" ? "paint" : "eraser")}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            tool === "eraser" && "bg-primary text-primary-foreground border-primary"
          )}
        >
          <Eraser size={16} />
        </button>
        <button
          onClick={() => onToolChange(tool === "fill" ? "paint" : "fill")}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            tool === "fill" && "bg-primary text-primary-foreground border-primary"
          )}
        >
          <PaintBucket size={16} />
        </button>
        <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-lg border transition-colors disabled:opacity-30">
          <Undo2 size={16} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-lg border transition-colors disabled:opacity-30">
          <Redo2 size={16} />
        </button>
        <button onClick={onClear} className="p-2 rounded-lg border hover:bg-destructive hover:text-destructive-foreground transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onToolChange(tool === "eraser" ? "paint" : "eraser")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
            tool === "eraser" && "bg-primary text-primary-foreground border-primary"
          )}
        >
          <Eraser size={14} /> Eraser
        </button>
        <button
          onClick={() => onToolChange(tool === "fill" ? "paint" : "fill")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
            tool === "fill" && "bg-primary text-primary-foreground border-primary"
          )}
        >
          <PaintBucket size={14} /> Fill
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="p-1.5 rounded-lg border text-xs hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <Undo2 size={14} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" className="p-1.5 rounded-lg border text-xs hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <Redo2 size={14} />
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <button onClick={onZoomOut} className="p-1.5 rounded-lg border text-xs hover:bg-muted transition-colors">
          <ZoomOut size={14} />
        </button>
        <span className="text-xs font-mono font-semibold w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="p-1.5 rounded-lg border text-xs hover:bg-muted transition-colors">
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  );
}
