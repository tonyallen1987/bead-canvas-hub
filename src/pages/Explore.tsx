import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Work {
  id: number;
  title: string;
  author: string;
  likes: number;
  comments: number;
  colors: string[];
  rows: number;
  cols: number;
}

const beadColors = [
  "#E8708A", "#E88570", "#6BC5A0", "#60B5E8",
  "#A580D0", "#E8D060", "#E8B895", "#88B890",
  "#F5F5F0", "#333333", "#E84040", "#4080E8",
];

function generatePixelArt(rows: number, cols: number): string[][] {
  const palette = beadColors.slice(0, 4 + Math.floor(Math.random() * 4));
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      Math.random() > 0.15 ? palette[Math.floor(Math.random() * palette.length)] : "transparent"
    )
  );
}

const sampleWorks: (Work & { grid: string[][] })[] = [
  { id: 1, title: "像素小狐狸", author: "BeadMaster", likes: 234, comments: 18, colors: ["#E88570", "#E8D060"], rows: 12, cols: 12 },
  { id: 2, title: "樱花树", author: "PixelArt酱", likes: 189, comments: 12, colors: ["#E8708A", "#88B890"], rows: 16, cols: 10 },
  { id: 3, title: "游戏手柄", author: "RetroFan", likes: 312, comments: 25, colors: ["#333333", "#E84040"], rows: 10, cols: 14 },
  { id: 4, title: "彩虹独角兽", author: "ColorDream", likes: 456, comments: 32, colors: ["#A580D0", "#E8708A"], rows: 14, cols: 12 },
  { id: 5, title: "星空夜景", author: "NightOwl", likes: 178, comments: 9, colors: ["#4080E8", "#E8D060"], rows: 12, cols: 16 },
  { id: 6, title: "可爱猫咪", author: "MeowPixel", likes: 567, comments: 45, colors: ["#E8B895", "#333333"], rows: 14, cols: 14 },
  { id: 7, title: "马里奥蘑菇", author: "GameLover", likes: 423, comments: 28, colors: ["#E84040", "#F5F5F0"], rows: 10, cols: 10 },
  { id: 8, title: "海洋世界", author: "OceanBlue", likes: 201, comments: 15, colors: ["#60B5E8", "#6BC5A0"], rows: 16, cols: 12 },
].map((w) => ({ ...w, grid: generatePixelArt(w.rows, w.cols) }));

export default function Explore() {
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">探索作品</h1>
          <p className="text-muted-foreground mt-1">发现社区中精彩的拼豆创作</p>
        </div>
      </div>

      {/* Masonry-ish grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {sampleWorks.map((work) => (
          <div
            key={work.id}
            className="break-inside-avoid bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {/* Pixel art preview */}
            <div className="p-4 flex justify-center bg-muted/30">
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${work.cols}, 1fr)`,
                  width: "100%",
                  maxWidth: 280,
                  aspectRatio: `${work.cols}/${work.rows}`,
                }}
              >
                {work.grid.flat().map((color, i) => (
                  <span
                    key={i}
                    className="rounded-[1px]"
                    style={{ backgroundColor: color === "transparent" ? "transparent" : color }}
                  />
                ))}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold">{work.title}</h3>
              <p className="text-sm text-muted-foreground">@{work.author}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <button
                  onClick={() => toggleLike(work.id)}
                  className={cn(
                    "flex items-center gap-1 transition-colors",
                    liked.has(work.id) && "text-primary"
                  )}
                >
                  <Heart size={16} fill={liked.has(work.id) ? "currentColor" : "none"} />
                  {work.likes + (liked.has(work.id) ? 1 : 0)}
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle size={16} /> {work.comments}
                </span>
                <Bookmark size={16} className="ml-auto cursor-pointer hover:text-foreground transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
