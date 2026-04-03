import { useState } from "react";
import { Search, Download, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["全部", "动物", "游戏", "食物", "花卉", "节日", "字母"];

const beadColors = ["#E8708A", "#E88570", "#6BC5A0", "#60B5E8", "#A580D0", "#E8D060", "#E8B895", "#1a1a1a", "#F5F5F0"];

function makeGrid(rows: number, cols: number, seed: number): string[][] {
  const pal = beadColors.slice(seed % 3, (seed % 3) + 4);
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const v = (r * 7 + c * 13 + seed) % 10;
      return v < 2 ? "transparent" : pal[v % pal.length];
    })
  );
}

const patterns = [
  { id: 1, title: "小柴犬", cat: "动物", size: "12×12", downloads: 1234, rows: 12, cols: 12 },
  { id: 2, title: "马里奥", cat: "游戏", size: "16×16", downloads: 2345, rows: 16, cols: 16 },
  { id: 3, title: "草莓蛋糕", cat: "食物", size: "10×10", downloads: 987, rows: 10, cols: 10 },
  { id: 4, title: "向日葵", cat: "花卉", size: "14×14", downloads: 876, rows: 14, cols: 14 },
  { id: 5, title: "圣诞树", cat: "节日", size: "12×16", downloads: 1567, rows: 16, cols: 12 },
  { id: 6, title: "字母 A-Z", cat: "字母", size: "8×8", downloads: 3210, rows: 8, cols: 8 },
  { id: 7, title: "小企鹅", cat: "动物", size: "12×12", downloads: 1100, rows: 12, cols: 12 },
  { id: 8, title: "皮卡丘", cat: "游戏", size: "16×16", downloads: 4567, rows: 16, cols: 16 },
  { id: 9, title: "寿司拼盘", cat: "食物", size: "14×10", downloads: 789, rows: 10, cols: 14 },
].map((p) => ({ ...p, grid: makeGrid(p.rows, p.cols, p.id * 37) }));

export default function Patterns() {
  const [cat, setCat] = useState("全部");
  const [search, setSearch] = useState("");

  const filtered = patterns.filter(
    (p) =>
      (cat === "全部" || p.cat === cat) &&
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold mb-2">图纸库</h1>
      <p className="text-muted-foreground mb-6">浏览和下载社区精选拼豆图纸</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索图纸..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4 flex justify-center bg-muted/30">
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${p.cols}, 1fr)`,
                  width: "100%",
                  maxWidth: 200,
                  aspectRatio: `${p.cols}/${p.rows}`,
                }}
              >
                {p.grid.flat().map((color, i) => (
                  <span
                    key={i}
                    className="rounded-[1px]"
                    style={{ backgroundColor: color === "transparent" ? "transparent" : color }}
                  />
                ))}
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{p.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <Grid3X3 size={14} /> {p.size}
                  <span>·</span>
                  <Download size={14} /> {p.downloads}
                </div>
              </div>
              <button className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
