// 8 hand-crafted pixel-art seed patterns for the Explore cold-start experience.
// Each grid uses short hex colours; "T" = transparent.

const T = "transparent";
const R = "#e53e3e"; // red
const P = "#1a1a2e"; // dark / black
const W = "#ffffff"; // white
const Y = "#f6e05e"; // yellow
const G = "#48bb78"; // green
const BR = "#a0522d"; // brown
const BL = "#4299e1"; // blue
const GR = "#a0aec0"; // grey
const O = "#ed8936"; // orange
const PK = "#ed64a6"; // pink
const LB = "#63b3ed"; // light blue
const VL = "#9f7aea"; // violet
const RD = "#fc8181"; // light red
const DG = "#2d3748"; // dark grey
const LG = "#c6f6d5"; // light green
const SK = "#fdd"; // skin

// Helper to build a grid from row strings for compactness
function g(rows: string[][], cols: number): string[][] {
  return rows.map((r) => {
    while (r.length < cols) r.push(T);
    return r.slice(0, cols);
  });
}

export interface SeedPattern {
  id: string;
  title: string;
  slug: string;
  grid_data: string[][];
  grid_rows: number;
  grid_cols: number;
  created_at: string;
  difficulty: "Easy" | "Medium";
  author: string;
  isSeed: true;
}

// ── 1. Classic Red Heart (11×10) ────────────────────────────
const heart: string[][] = [
  [T, T, R, R, T, T, T, R, R, T, T],
  [T, R, R, R, R, T, R, R, R, R, T],
  [R, R, R, R, R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R, R, R, R, R],
  [T, R, R, R, R, R, R, R, R, R, T],
  [T, T, R, R, R, R, R, R, R, T, T],
  [T, T, T, R, R, R, R, R, T, T, T],
  [T, T, T, T, R, R, R, T, T, T, T],
  [T, T, T, T, T, R, T, T, T, T, T],
];

// ── 2. Kawaii Panda (11×11) ─────────────────────────────────
const panda: string[][] = [
  [T, T, P, P, T, T, T, P, P, T, T],
  [T, P, P, P, T, T, T, P, P, P, T],
  [T, P, P, W, W, W, W, W, P, P, T],
  [T, T, W, W, W, W, W, W, W, T, T],
  [T, W, W, P, W, W, W, P, W, W, T],
  [T, W, W, P, W, W, W, P, W, W, T],
  [T, W, W, W, W, P, W, W, W, W, T],
  [T, T, W, W, PK, PK, PK, W, W, T, T],
  [T, T, T, W, W, W, W, W, T, T, T],
  [T, T, P, P, W, W, W, P, P, T, T],
  [T, T, P, P, T, T, T, P, P, T, T],
];

// ── 3. Pixel Sunflower (11×13) ──────────────────────────────
const sunflower: string[][] = [
  [T, T, T, T, Y, Y, Y, T, T, T, T],
  [T, T, Y, Y, Y, Y, Y, Y, Y, T, T],
  [T, Y, Y, Y, BR, BR, BR, Y, Y, Y, T],
  [T, Y, Y, BR, BR, BR, BR, BR, Y, Y, T],
  [Y, Y, Y, BR, BR, BR, BR, BR, Y, Y, Y],
  [Y, Y, Y, BR, BR, BR, BR, BR, Y, Y, Y],
  [Y, Y, Y, BR, BR, BR, BR, BR, Y, Y, Y],
  [T, Y, Y, BR, BR, BR, BR, BR, Y, Y, T],
  [T, Y, Y, Y, BR, BR, BR, Y, Y, Y, T],
  [T, T, Y, Y, Y, Y, Y, Y, Y, T, T],
  [T, T, T, T, Y, Y, Y, T, T, T, T],
  [T, T, T, T, T, G, T, T, T, T, T],
  [T, T, T, T, G, G, G, T, T, T, T],
];

// ── 4. Blue Gaming Controller (13×9) ────────────────────────
const controller: string[][] = [
  [T, T, T, DG, DG, DG, DG, DG, DG, DG, T, T, T],
  [T, T, DG, DG, DG, DG, DG, DG, DG, DG, DG, T, T],
  [T, DG, DG, BL, DG, DG, DG, DG, BL, DG, DG, DG, T],
  [DG, DG, BL, BL, BL, DG, DG, BL, BL, BL, DG, DG, DG],
  [DG, DG, DG, BL, DG, DG, DG, DG, BL, DG, DG, DG, DG],
  [DG, DG, DG, DG, DG, GR, GR, DG, DG, DG, DG, DG, DG],
  [T, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, T],
  [T, T, DG, DG, DG, DG, DG, DG, DG, DG, DG, T, T],
  [T, T, T, DG, DG, T, T, T, DG, DG, T, T, T],
];

// ── 5. Tiny Dinosaur (11×11) ────────────────────────────────
const dino: string[][] = [
  [T, T, T, T, T, T, G, G, G, T, T],
  [T, T, T, T, T, G, G, G, G, G, T],
  [T, T, T, T, T, G, W, G, G, G, T],
  [T, T, T, T, T, G, G, G, G, T, T],
  [T, G, T, T, G, G, G, G, T, T, T],
  [T, G, G, G, G, G, G, G, T, T, T],
  [T, T, G, G, G, G, G, T, T, T, T],
  [T, T, T, G, G, G, G, T, T, T, T],
  [T, T, T, G, G, G, G, T, T, T, T],
  [T, T, T, G, T, T, G, T, T, T, T],
  [T, T, G, G, T, G, G, T, T, T, T],
];

// ── 6. Rainbow Cloud (13×9) ─────────────────────────────────
const cloud: string[][] = [
  [T, T, T, T, W, W, W, W, W, T, T, T, T],
  [T, T, W, W, W, W, W, W, W, W, W, T, T],
  [T, W, W, W, W, W, W, W, W, W, W, W, T],
  [W, W, W, W, W, W, W, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W, W, W, W, W],
  [T, R, R, O, O, Y, Y, G, G, BL, BL, VL, T],
  [T, T, R, O, O, Y, Y, G, G, BL, VL, T, T],
  [T, T, T, O, O, Y, Y, G, G, BL, T, T, T],
  [T, T, T, T, O, Y, Y, G, BL, T, T, T, T],
];

// ── 7. Space Rocket (9×15) ──────────────────────────────────
const rocket: string[][] = [
  [T, T, T, T, R, T, T, T, T],
  [T, T, T, R, R, R, T, T, T],
  [T, T, T, R, W, R, T, T, T],
  [T, T, R, W, W, W, R, T, T],
  [T, T, R, W, BL, W, R, T, T],
  [T, T, R, W, BL, W, R, T, T],
  [T, T, R, W, W, W, R, T, T],
  [T, T, R, GR, GR, GR, R, T, T],
  [T, R, R, GR, GR, GR, R, R, T],
  [R, R, R, GR, GR, GR, R, R, R],
  [R, T, R, GR, GR, GR, R, T, R],
  [T, T, R, R, R, R, R, T, T],
  [T, T, T, O, Y, O, T, T, T],
  [T, T, T, Y, O, Y, T, T, T],
  [T, T, T, T, Y, T, T, T, T],
];

// ── 8. Corgi Face (11×11) ───────────────────────────────────
const corgi: string[][] = [
  [T, O, O, T, T, T, T, T, O, O, T],
  [O, O, O, O, T, T, T, O, O, O, O],
  [O, O, O, O, W, W, W, O, O, O, O],
  [T, O, O, W, W, W, W, W, O, O, T],
  [T, T, W, W, P, W, P, W, W, T, T],
  [T, T, W, W, W, W, W, W, W, T, T],
  [T, T, W, W, W, P, W, W, W, T, T],
  [T, T, T, W, SK, SK, SK, W, T, T, T],
  [T, T, T, W, W, PK, W, W, T, T, T],
  [T, T, T, T, W, W, W, T, T, T, T],
  [T, T, T, T, T, W, T, T, T, T, T],
];

export const seedPatterns: SeedPattern[] = [
  {
    id: "seed-heart",
    title: "Classic Red Heart",
    slug: "classic-red-heart",
    grid_data: heart,
    grid_rows: heart.length,
    grid_cols: 11,
    created_at: "2026-03-15T10:00:00Z",
    difficulty: "Easy",
    author: "Perlerly Team",
    isSeed: true,
  },
  {
    id: "seed-panda",
    title: "Kawaii Panda",
    slug: "kawaii-panda",
    grid_data: panda,
    grid_rows: panda.length,
    grid_cols: 11,
    created_at: "2026-03-14T09:00:00Z",
    difficulty: "Easy",
    author: "Perlerly Team",
    isSeed: true,
  },
  {
    id: "seed-sunflower",
    title: "Pixel Sunflower",
    slug: "pixel-sunflower",
    grid_data: sunflower,
    grid_rows: sunflower.length,
    grid_cols: 11,
    created_at: "2026-03-13T08:00:00Z",
    difficulty: "Medium",
    author: "Perlerly Team",
    isSeed: true,
  },
  {
    id: "seed-controller",
    title: "Blue Gaming Controller",
    slug: "blue-gaming-controller",
    grid_data: controller,
    grid_rows: controller.length,
    grid_cols: 13,
    created_at: "2026-03-12T07:00:00Z",
    difficulty: "Medium",
    author: "Perlerly Team",
    isSeed: true,
  },
  {
    id: "seed-dino",
    title: "Tiny Dinosaur",
    slug: "tiny-dinosaur",
    grid_data: dino,
    grid_rows: dino.length,
    grid_cols: 11,
    created_at: "2026-03-11T06:00:00Z",
    difficulty: "Easy",
    author: "Perlerly Team",
    isSeed: true,
  },
  {
    id: "seed-cloud",
    title: "Rainbow Cloud",
    slug: "rainbow-cloud",
    grid_data: cloud,
    grid_rows: cloud.length,
    grid_cols: 13,
    created_at: "2026-03-10T05:00:00Z",
    difficulty: "Easy",
    author: "Perlerly Team",
    isSeed: true,
  },
  {
    id: "seed-rocket",
    title: "Space Rocket",
    slug: "space-rocket",
    grid_data: rocket,
    grid_rows: rocket.length,
    grid_cols: 9,
    created_at: "2026-03-09T04:00:00Z",
    difficulty: "Medium",
    author: "Perlerly Team",
    isSeed: true,
  },
  {
    id: "seed-corgi",
    title: "Corgi Face",
    slug: "corgi-face",
    grid_data: corgi,
    grid_rows: corgi.length,
    grid_cols: 11,
    created_at: "2026-03-08T03:00:00Z",
    difficulty: "Easy",
    author: "Perlerly Team",
    isSeed: true,
  },
];
