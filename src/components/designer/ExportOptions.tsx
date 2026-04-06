import { Download, FileText, Printer, FileSpreadsheet, Lock } from "lucide-react";
import { PERLER_COLOR_MAP } from "@/data/perlerColors";

const EMPTY = "transparent";

function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-pattern";
}

function addWatermark(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) {
  const text = "perlerly.com";
  const fontSize = 14;
  const paddingX = 12;
  const paddingY = 6;
  const margin = 12;

  ctx.font = `bold ${fontSize}px sans-serif`;
  const metrics = ctx.measureText(text);
  const pillW = metrics.width + paddingX * 2;
  const pillH = fontSize + paddingY * 2;
  const x = canvasW - pillW - margin;
  const y = canvasH - pillH - margin;
  const r = pillH / 2;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.roundRect(x, y, pillW, pillH, r);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + paddingX, y + pillH / 2);
  ctx.textBaseline = "alphabetic";
}

interface ExportOptionsProps {
  grid: string[][];
  size: number;
  title: string;
  isPaid: boolean;
}

function getBeadCounts(grid: string[][]) {
  const counts = new Map<string, number>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== EMPTY) counts.set(cell, (counts.get(cell) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([hex, count]) => ({ hex, count, color: PERLER_COLOR_MAP.get(hex) }))
    .sort((a, b) => b.count - a.count);
}

function exportPNGWithGrid(grid: string[][], size: number, title: string) {
  const scale = 20;
  const canvas = document.createElement("canvas");
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell !== EMPTY) {
        ctx.fillStyle = cell;
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    })
  );

  // Grid overlay
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= size; i++) {
    ctx.beginPath();
    ctx.moveTo(i * scale, 0);
    ctx.lineTo(i * scale, size * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * scale);
    ctx.lineTo(size * scale, i * scale);
    ctx.stroke();
  }

  addWatermark(ctx, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slugify(title)}-perlerly.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}

function exportCSV(grid: string[][]) {
  const beadCounts = getBeadCounts(grid);
  if (beadCounts.length === 0) return;

  const rows = [
    ["Color Name", "Product Code", "Hex", "Quantity"],
    ...beadCounts.map(({ hex, count, color }) => [
      color?.name ?? "Unknown",
      color?.code ?? "",
      hex,
      count.toString(),
    ]),
    [],
    ["Total", "", "", beadCounts.reduce((s, b) => s + b.count, 0).toString()],
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "perlerly-shopping-list.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportPrintableGrid(grid: string[][], size: number, title: string) {
  const scale = Math.min(Math.floor(700 / size), 20);
  const canvas = document.createElement("canvas");
  const padding = 60;
  canvas.width = size * scale + padding * 2;
  canvas.height = size * scale + padding * 2 + 40;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = "#000000";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(title || "Perler Pattern", padding, 30);
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#666666";
  ctx.fillText(`${size}×${size} · perlerly.lovable.app`, padding, 48);

  const ox = padding;
  const oy = padding + 10;

  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell !== EMPTY) {
        ctx.fillStyle = cell;
        ctx.fillRect(ox + c * scale, oy + r * scale, scale, scale);
      }
    })
  );

  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= size; i++) {
    ctx.beginPath();
    ctx.moveTo(ox + i * scale, oy);
    ctx.lineTo(ox + i * scale, oy + size * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, oy + i * scale);
    ctx.lineTo(ox + size * scale, oy + i * scale);
    ctx.stroke();
  }

  // Row/col numbers
  ctx.fillStyle = "#999";
  ctx.font = `${Math.min(scale - 2, 10)}px monospace`;
  ctx.textAlign = "center";
  for (let i = 0; i < size; i++) {
    if (i % 5 === 0) {
      ctx.fillText(String(i + 1), ox + i * scale + scale / 2, oy - 4);
      ctx.textAlign = "right";
      ctx.fillText(String(i + 1), ox - 4, oy + i * scale + scale / 2 + 3);
      ctx.textAlign = "center";
    }
  }

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "perlerly-printable.png";
  a.click();
}

function exportPDFAsImage(grid: string[][], size: number, title: string) {
  // Generate a rich PNG as a "PDF preview" — real PDF would need a library
  const beadCounts = getBeadCounts(grid);
  const scale = Math.min(Math.floor(500 / size), 16);
  const legendHeight = beadCounts.length * 22 + 60;
  const canvas = document.createElement("canvas");
  const padding = 50;
  canvas.width = size * scale + padding * 2 + 280;
  canvas.height = Math.max(size * scale + padding * 2 + 60, legendHeight + padding * 2);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = "#000";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(title || "Perler Pattern", padding, 35);
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(`${size}×${size} grid · perlerly.lovable.app`, padding, 52);

  const ox = padding;
  const oy = 70;

  // Grid
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell !== EMPTY) {
        ctx.fillStyle = cell;
        ctx.fillRect(ox + c * scale, oy + r * scale, scale, scale);
      }
    })
  );

  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= size; i++) {
    ctx.beginPath();
    ctx.moveTo(ox + i * scale, oy);
    ctx.lineTo(ox + i * scale, oy + size * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, oy + i * scale);
    ctx.lineTo(ox + size * scale, oy + i * scale);
    ctx.stroke();
  }

  // Legend
  const lx = ox + size * scale + 30;
  let ly = oy;
  ctx.fillStyle = "#000";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("Color Legend", lx, ly);
  ly += 8;
  ctx.font = "10px sans-serif";
  ctx.fillStyle = "#888";
  ctx.fillText(`${beadCounts.reduce((s, b) => s + b.count, 0)} beads · ${beadCounts.length} colors`, lx, ly + 12);
  ly += 28;

  for (const { hex, count, color } of beadCounts) {
    ctx.fillStyle = hex;
    ctx.fillRect(lx, ly, 14, 14);
    ctx.strokeStyle = "#ccc";
    ctx.strokeRect(lx, ly, 14, 14);
    ctx.fillStyle = "#333";
    ctx.font = "11px sans-serif";
    ctx.fillText(`${color?.name ?? hex}`, lx + 20, ly + 11);
    ctx.fillStyle = "#999";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`×${count}`, lx + 240, ly + 11);
    ctx.textAlign = "left";
    ly += 22;
  }

  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "perlerly-pattern-full.png";
  a.click();
}

export default function ExportOptions({ grid, size, title, isPaid }: ExportOptionsProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Export</label>

      <button
        onClick={() => exportPNGWithGrid(grid, size)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-border font-semibold text-sm hover:bg-muted transition-colors"
      >
        <Download size={14} />
        <span className="flex-1 text-left">PNG with Grid</span>
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-semibold">FREE</span>
      </button>

      <button
        onClick={() => isPaid ? exportPDFAsImage(grid, size, title) : undefined}
        disabled={!isPaid}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <FileText size={14} />
        <span className="flex-1 text-left">PDF with Color Legend</span>
        {!isPaid && <Lock size={12} className="text-muted-foreground" />}
      </button>

      <button
        onClick={() => isPaid ? exportPrintableGrid(grid, size, title) : undefined}
        disabled={!isPaid}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Printer size={14} />
        <span className="flex-1 text-left">Printable Grid</span>
        {!isPaid && <Lock size={12} className="text-muted-foreground" />}
      </button>

      <button
        onClick={() => isPaid ? exportCSV(grid) : undefined}
        disabled={!isPaid}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet size={14} />
        <span className="flex-1 text-left">Shopping List CSV</span>
        {!isPaid && <Lock size={12} className="text-muted-foreground" />}
      </button>

      {!isPaid && (
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          🔒 PDF, Printable & CSV exports require a Pro account
        </p>
      )}
    </div>
  );
}
