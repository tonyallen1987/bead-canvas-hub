// Library seed patterns – 14 hand-crafted pixel art designs with full metadata.

const T = "transparent";
const R = "#e53e3e";
const P = "#1a1a2e";
const W = "#ffffff";
const Y = "#f6e05e";
const G = "#48bb78";
const BR = "#a0522d";
const BL = "#4299e1";
const GR = "#a0aec0";
const O = "#ed8936";
const PK = "#ed64a6";
const LB = "#63b3ed";
const VL = "#9f7aea";
const DG = "#2d3748";
const SK = "#fdd";
const RD = "#fc8181";
const LG = "#c6f6d5";
const CR = "#e53e3e";
const DB = "#2b6cb0";

export type Category = "All" | "Gaming" | "Animals" | "Nature" | "Holidays" | "Starter Kits";
export type Difficulty = "Easy" | "Medium" | "Advanced";

export interface LibraryPattern {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  bead_count: number;
  colors_used: number;
  estimated_minutes: number;
  grid_data: string[][];
  grid_rows: number;
  grid_cols: number;
}

// ── 1. Classic Pokéball (10×10) ─────────────────────────────
const pokeball: string[][] = [
  [T, T, R, R, R, R, R, R, T, T],
  [T, R, R, R, R, R, R, R, R, T],
  [R, R, R, R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R, R, R, R],
  [P, P, P, P, W, W, P, P, P, P],
  [P, P, P, W, W, W, W, P, P, P],
  [W, W, W, W, P, P, W, W, W, W],
  [W, W, W, W, W, W, W, W, W, W],
  [T, W, W, W, W, W, W, W, W, T],
  [T, T, W, W, W, W, W, W, T, T],
];

// ── 2. Spring Tulip (9×13) ──────────────────────────────────
const tulip: string[][] = [
  [T, T, T, T, R, T, T, T, T],
  [T, T, T, R, R, R, T, T, T],
  [T, T, R, R, R, R, R, T, T],
  [T, R, R, R, R, R, R, R, T],
  [T, R, R, R, R, R, R, R, T],
  [T, R, R, R, R, R, R, R, T],
  [T, T, R, R, R, R, R, T, T],
  [T, T, T, T, G, T, T, T, T],
  [T, T, T, T, G, T, T, T, T],
  [T, T, T, T, G, T, T, T, T],
  [T, T, T, G, G, G, T, T, T],
  [T, T, G, T, G, T, G, T, T],
  [T, T, T, T, G, T, T, T, T],
];

// ── 3. Pixel Shiba Inu (13×13) ──────────────────────────────
const shiba: string[][] = [
  [T, T, O, O, T, T, T, T, T, O, O, T, T],
  [T, O, O, O, O, T, T, T, O, O, O, O, T],
  [T, O, O, O, O, O, T, O, O, O, O, O, T],
  [T, T, O, O, O, O, O, O, O, O, O, T, T],
  [T, T, O, W, W, W, W, W, W, W, O, T, T],
  [T, T, W, W, W, W, W, W, W, W, W, T, T],
  [T, T, W, P, W, W, W, W, P, W, W, T, T],
  [T, T, W, W, W, W, P, W, W, W, W, T, T],
  [T, T, W, W, W, SK, SK, SK, W, W, W, T, T],
  [T, T, T, W, W, W, PK, W, W, W, T, T, T],
  [T, T, T, T, W, W, W, W, W, T, T, T, T],
  [T, T, T, T, T, W, W, W, T, T, T, T, T],
  [T, T, T, T, T, T, W, T, T, T, T, T, T],
];

// ── 4. Retro Game Boy (11×15) ───────────────────────────────
const gameboy: string[][] = [
  [T, T, GR, GR, GR, GR, GR, GR, GR, T, T],
  [T, GR, GR, GR, GR, GR, GR, GR, GR, GR, T],
  [T, GR, DG, DG, DG, DG, DG, DG, DG, GR, T],
  [T, GR, DG, LG, LG, LG, LG, LG, DG, GR, T],
  [T, GR, DG, LG, LG, LG, LG, LG, DG, GR, T],
  [T, GR, DG, LG, LG, LG, LG, LG, DG, GR, T],
  [T, GR, DG, LG, LG, LG, LG, LG, DG, GR, T],
  [T, GR, DG, DG, DG, DG, DG, DG, DG, GR, T],
  [T, GR, GR, GR, GR, GR, GR, GR, GR, GR, T],
  [T, GR, GR, GR, DG, GR, GR, GR, GR, GR, T],
  [T, GR, GR, DG, DG, DG, GR, R, GR, GR, T],
  [T, GR, GR, GR, DG, GR, R, GR, GR, GR, T],
  [T, GR, GR, GR, GR, GR, GR, GR, GR, GR, T],
  [T, GR, GR, GR, GR, GR, GR, GR, GR, GR, T],
  [T, T, GR, GR, GR, GR, GR, GR, GR, T, T],
];

// ── 5. Simple Star (9×9) ───────────────────────────────────
const star: string[][] = [
  [T, T, T, T, Y, T, T, T, T],
  [T, T, T, Y, Y, Y, T, T, T],
  [T, T, T, Y, Y, Y, T, T, T],
  [Y, Y, Y, Y, Y, Y, Y, Y, Y],
  [T, Y, Y, Y, Y, Y, Y, Y, T],
  [T, T, Y, Y, Y, Y, Y, T, T],
  [T, Y, Y, T, Y, T, Y, Y, T],
  [T, Y, T, T, T, T, T, Y, T],
  [Y, T, T, T, T, T, T, T, Y],
];

// ── 6. Christmas Ornament (9×11) ────────────────────────────
const ornament: string[][] = [
  [T, T, T, T, GR, T, T, T, T],
  [T, T, T, GR, GR, GR, T, T, T],
  [T, T, T, T, R, T, T, T, T],
  [T, T, R, R, R, R, R, T, T],
  [T, R, R, W, R, R, R, R, T],
  [R, R, W, R, R, G, R, R, R],
  [R, R, R, R, G, R, R, R, R],
  [R, R, R, G, R, R, W, R, R],
  [T, R, R, R, R, R, R, R, T],
  [T, T, R, R, R, R, R, T, T],
  [T, T, T, R, R, R, T, T, T],
];

// ── 7. Pixel Cat (11×11) ───────────────────────────────────
const cat: string[][] = [
  [T, DG, T, T, T, T, T, T, T, DG, T],
  [DG, DG, DG, T, T, T, T, T, DG, DG, DG],
  [DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG],
  [DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG],
  [DG, DG, G, DG, DG, DG, DG, G, DG, DG, DG],
  [DG, DG, G, DG, DG, DG, DG, G, DG, DG, DG],
  [DG, DG, DG, DG, PK, DG, DG, DG, DG, DG, DG],
  [DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG],
  [T, DG, DG, DG, DG, DG, DG, DG, DG, DG, T],
  [T, T, DG, DG, DG, DG, DG, DG, DG, T, T],
  [T, T, T, DG, DG, DG, DG, DG, T, T, T],
];

// ── 8. Snowflake (11×11) ───────────────────────────────────
const snowflake: string[][] = [
  [T, T, T, T, T, LB, T, T, T, T, T],
  [T, T, LB, T, T, LB, T, T, LB, T, T],
  [T, T, T, LB, T, LB, T, LB, T, T, T],
  [T, T, T, T, LB, LB, LB, T, T, T, T],
  [T, T, T, LB, LB, W, LB, LB, T, T, T],
  [LB, LB, LB, LB, W, W, W, LB, LB, LB, LB],
  [T, T, T, LB, LB, W, LB, LB, T, T, T],
  [T, T, T, T, LB, LB, LB, T, T, T, T],
  [T, T, T, LB, T, LB, T, LB, T, T, T],
  [T, T, LB, T, T, LB, T, T, LB, T, T],
  [T, T, T, T, T, LB, T, T, T, T, T],
];

// ── 9. Mushroom (9×9) ──────────────────────────────────────
const mushroom: string[][] = [
  [T, T, T, R, R, R, T, T, T],
  [T, T, R, R, W, R, R, T, T],
  [T, R, R, W, R, R, W, R, T],
  [R, R, R, R, R, R, R, R, R],
  [T, T, SK, SK, SK, SK, SK, T, T],
  [T, T, SK, P, SK, P, SK, T, T],
  [T, T, SK, SK, SK, SK, SK, T, T],
  [T, T, SK, SK, SK, SK, SK, T, T],
  [T, T, T, SK, SK, SK, T, T, T],
];

// ── 10. Butterfly (13×9) ───────────────────────────────────
const butterfly: string[][] = [
  [T, VL, VL, T, T, T, T, T, VL, VL, T, T, T],
  [VL, VL, PK, VL, T, T, T, VL, PK, VL, VL, T, T],
  [VL, PK, PK, PK, VL, T, VL, PK, PK, PK, VL, T, T],
  [VL, VL, PK, VL, VL, P, VL, VL, PK, VL, VL, T, T],
  [T, VL, VL, VL, P, P, P, VL, VL, VL, T, T, T],
  [VL, VL, PK, VL, VL, P, VL, VL, PK, VL, VL, T, T],
  [VL, PK, PK, PK, VL, T, VL, PK, PK, PK, VL, T, T],
  [VL, VL, PK, VL, T, T, T, VL, PK, VL, VL, T, T],
  [T, VL, VL, T, T, T, T, T, VL, VL, T, T, T],
];

// ── 11. Simple Heart (7×7 starter) ─────────────────────────
const miniHeart: string[][] = [
  [T, R, R, T, R, R, T],
  [R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R],
  [T, R, R, R, R, R, T],
  [T, T, R, R, R, T, T],
  [T, T, T, R, T, T, T],
];

// ── 12. Rainbow Stripe (9×5 starter) ───────────────────────
const rainbow: string[][] = [
  [R, R, R, R, R, R, R, R, R],
  [O, O, O, O, O, O, O, O, O],
  [Y, Y, Y, Y, Y, Y, Y, Y, Y],
  [G, G, G, G, G, G, G, G, G],
  [BL, BL, BL, BL, BL, BL, BL, BL, BL],
];

// ── 13. Frog Face (11×9) ───────────────────────────────────
const frog: string[][] = [
  [T, T, G, G, T, T, T, G, G, T, T],
  [T, G, W, G, G, T, G, G, W, G, T],
  [T, G, P, G, G, G, G, G, P, G, T],
  [T, T, G, G, G, G, G, G, G, T, T],
  [G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G],
  [T, G, G, R, G, G, G, R, G, G, T],
  [T, T, G, G, G, G, G, G, G, T, T],
  [T, T, T, G, G, G, G, G, T, T, T],
];

// ── 14. Cactus (7×11) ─────────────────────────────────────
const cactus: string[][] = [
  [T, T, T, G, T, T, T],
  [T, T, T, G, T, T, T],
  [T, T, G, G, G, T, T],
  [T, T, G, G, G, T, T],
  [G, T, G, G, G, T, T],
  [G, G, G, G, G, T, G],
  [T, G, G, G, G, G, G],
  [T, T, G, G, G, G, T],
  [T, T, G, G, G, T, T],
  [T, BR, BR, BR, BR, BR, T],
  [T, BR, BR, BR, BR, BR, T],
];

function countColors(grid: string[][]): number {
  const s = new Set(grid.flat().filter((c) => c !== T));
  return s.size;
}

function countBeads(grid: string[][]): number {
  return grid.flat().filter((c) => c !== T).length;
}

function estMinutes(beads: number): number {
  return Math.round(beads * 0.15 + 5);
}

export const libraryPatterns: LibraryPattern[] = [
  { id: "lib-pokeball", title: "Classic Pokéball", category: "Gaming", difficulty: "Easy", grid_data: pokeball, grid_rows: pokeball.length, grid_cols: 10, bead_count: countBeads(pokeball), colors_used: countColors(pokeball), estimated_minutes: estMinutes(countBeads(pokeball)) },
  { id: "lib-tulip", title: "Spring Tulip", category: "Nature", difficulty: "Easy", grid_data: tulip, grid_rows: tulip.length, grid_cols: 9, bead_count: countBeads(tulip), colors_used: countColors(tulip), estimated_minutes: estMinutes(countBeads(tulip)) },
  { id: "lib-shiba", title: "Pixel Shiba Inu", category: "Animals", difficulty: "Medium", grid_data: shiba, grid_rows: shiba.length, grid_cols: 13, bead_count: countBeads(shiba), colors_used: countColors(shiba), estimated_minutes: estMinutes(countBeads(shiba)) },
  { id: "lib-gameboy", title: "Retro Game Boy", category: "Gaming", difficulty: "Advanced", grid_data: gameboy, grid_rows: gameboy.length, grid_cols: 11, bead_count: countBeads(gameboy), colors_used: countColors(gameboy), estimated_minutes: estMinutes(countBeads(gameboy)) },
  { id: "lib-star", title: "Golden Star", category: "Starter Kits", difficulty: "Easy", grid_data: star, grid_rows: star.length, grid_cols: 9, bead_count: countBeads(star), colors_used: countColors(star), estimated_minutes: estMinutes(countBeads(star)) },
  { id: "lib-ornament", title: "Christmas Ornament", category: "Holidays", difficulty: "Medium", grid_data: ornament, grid_rows: ornament.length, grid_cols: 9, bead_count: countBeads(ornament), colors_used: countColors(ornament), estimated_minutes: estMinutes(countBeads(ornament)) },
  { id: "lib-cat", title: "Pixel Cat", category: "Animals", difficulty: "Easy", grid_data: cat, grid_rows: cat.length, grid_cols: 11, bead_count: countBeads(cat), colors_used: countColors(cat), estimated_minutes: estMinutes(countBeads(cat)) },
  { id: "lib-snowflake", title: "Snowflake", category: "Holidays", difficulty: "Easy", grid_data: snowflake, grid_rows: snowflake.length, grid_cols: 11, bead_count: countBeads(snowflake), colors_used: countColors(snowflake), estimated_minutes: estMinutes(countBeads(snowflake)) },
  { id: "lib-mushroom", title: "Red Mushroom", category: "Gaming", difficulty: "Easy", grid_data: mushroom, grid_rows: mushroom.length, grid_cols: 9, bead_count: countBeads(mushroom), colors_used: countColors(mushroom), estimated_minutes: estMinutes(countBeads(mushroom)) },
  { id: "lib-butterfly", title: "Butterfly", category: "Nature", difficulty: "Medium", grid_data: butterfly, grid_rows: butterfly.length, grid_cols: 13, bead_count: countBeads(butterfly), colors_used: countColors(butterfly), estimated_minutes: estMinutes(countBeads(butterfly)) },
  { id: "lib-mini-heart", title: "Simple Heart", category: "Starter Kits", difficulty: "Easy", grid_data: miniHeart, grid_rows: miniHeart.length, grid_cols: 7, bead_count: countBeads(miniHeart), colors_used: countColors(miniHeart), estimated_minutes: estMinutes(countBeads(miniHeart)) },
  { id: "lib-rainbow", title: "Rainbow Stripe", category: "Starter Kits", difficulty: "Easy", grid_data: rainbow, grid_rows: rainbow.length, grid_cols: 9, bead_count: countBeads(rainbow), colors_used: countColors(rainbow), estimated_minutes: estMinutes(countBeads(rainbow)) },
  { id: "lib-frog", title: "Frog Face", category: "Animals", difficulty: "Easy", grid_data: frog, grid_rows: frog.length, grid_cols: 11, bead_count: countBeads(frog), colors_used: countColors(frog), estimated_minutes: estMinutes(countBeads(frog)) },
  { id: "lib-cactus", title: "Cactus", category: "Nature", difficulty: "Easy", grid_data: cactus, grid_rows: cactus.length, grid_cols: 7, bead_count: countBeads(cactus), colors_used: countColors(cactus), estimated_minutes: estMinutes(countBeads(cactus)) },
];

export const categories: Category[] = ["All", "Gaming", "Animals", "Nature", "Holidays", "Starter Kits"];
export const difficulties: Difficulty[] = ["Easy", "Medium", "Advanced"];
