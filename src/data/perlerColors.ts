export interface PerlerColor {
  id: string;
  name: string;
  code: string; // Official Perler product code e.g. "P01"
  hex: string;
  r: number;
  g: number;
  b: number;
}

export interface ColorGroup {
  label: string;
  colors: PerlerColor[];
}

export const PERLER_COLORS: PerlerColor[] = [
  // Whites & Creams
  { id: "white", name: "White", code: "#80-17113", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
  { id: "cream", name: "Cream", code: "#80-17101", hex: "#F5F0DC", r: 245, g: 240, b: 220 },
  { id: "pastel-yellow", name: "Pastel Yellow", code: "#80-17102", hex: "#FCF3CF", r: 252, g: 243, b: 207 },
  { id: "toasted-marshmallow", name: "Toasted Marshmallow", code: "#80-17103", hex: "#E8DCC8", r: 232, g: 220, b: 200 },

  // Yellows & Golds
  { id: "yellow", name: "Yellow", code: "#80-17154", hex: "#F4D03F", r: 244, g: 208, b: 63 },
  { id: "cheddar", name: "Cheddar", code: "#80-17105", hex: "#F1C40F", r: 241, g: 196, b: 15 },
  { id: "gold", name: "Gold", code: "#80-17118", hex: "#D4AC0D", r: 212, g: 172, b: 13 },
  { id: "honey", name: "Honey", code: "#80-17108", hex: "#E5A826", r: 229, g: 168, b: 38 },
  { id: "butterscotch", name: "Butterscotch", code: "#80-17155", hex: "#E67E22", r: 230, g: 126, b: 34 },

  // Oranges
  { id: "orange", name: "Orange", code: "#80-17104", hex: "#F39C12", r: 243, g: 156, b: 18 },
  { id: "apricot", name: "Apricot", code: "#80-17156", hex: "#F5B041", r: 245, g: 176, b: 65 },
  { id: "hot-coral", name: "Hot Coral", code: "#80-17109", hex: "#FF7F50", r: 255, g: 127, b: 80 },
  { id: "tangerine", name: "Tangerine", code: "#80-17110", hex: "#E8702A", r: 232, g: 112, b: 42 },
  { id: "toffee", name: "Toffee", code: "#80-17157", hex: "#CA6F1E", r: 202, g: 111, b: 30 },

  // Reds
  { id: "red", name: "Red", code: "#80-17116", hex: "#BE3128", r: 190, g: 49, b: 40 },
  { id: "cherry", name: "Cherry", code: "#80-17160", hex: "#922B21", r: 146, g: 43, b: 33 },
  { id: "cranapple", name: "Cranapple", code: "#80-17111", hex: "#7B241C", r: 123, g: 36, b: 28 },
  { id: "raspberry", name: "Raspberry", code: "#80-17112", hex: "#C0392B", r: 192, g: 57, b: 43 },
  { id: "rust", name: "Rust", code: "#80-17117", hex: "#BA4A00", r: 186, g: 74, b: 0 },

  // Pinks
  { id: "pink", name: "Pink", code: "#80-17115", hex: "#FADBD8", r: 250, g: 219, b: 216 },
  { id: "bubblegum", name: "Bubblegum", code: "#80-17119", hex: "#F1948A", r: 241, g: 148, b: 138 },
  { id: "blush", name: "Blush", code: "#80-17120", hex: "#FFB6C1", r: 255, g: 182, b: 193 },
  { id: "magenta", name: "Magenta", code: "#80-17106", hex: "#D63384", r: 214, g: 51, b: 132 },
  { id: "flamingo", name: "Flamingo", code: "#80-17121", hex: "#E97F8F", r: 233, g: 127, b: 143 },
  { id: "salmon", name: "Salmon", code: "#80-17122", hex: "#F0A8A0", r: 240, g: 168, b: 160 },
  { id: "peach", name: "Peach", code: "#80-17158", hex: "#FFDAB9", r: 255, g: 218, b: 185 },

  // Purples
  { id: "lavender", name: "Lavender", code: "#80-17123", hex: "#D7BDE2", r: 215, g: 189, b: 226 },
  { id: "purple", name: "Purple", code: "#80-17124", hex: "#8E44AD", r: 142, g: 68, b: 173 },
  { id: "plum", name: "Plum", code: "#80-17114", hex: "#6C3483", r: 108, g: 52, b: 131 },
  { id: "mulberry", name: "Mulberry", code: "#80-17161", hex: "#7D3C98", r: 125, g: 60, b: 152 },
  { id: "grape", name: "Grape", code: "#80-17125", hex: "#5B2C6F", r: 91, g: 44, b: 111 },
  { id: "orchid", name: "Orchid", code: "#80-17126", hex: "#BB8FCE", r: 187, g: 143, b: 206 },

  // Blues
  { id: "light-blue", name: "Light Blue", code: "#80-17127", hex: "#AED6F1", r: 174, g: 214, b: 241 },
  { id: "periwinkle", name: "Periwinkle", code: "#80-17128", hex: "#85C1E9", r: 133, g: 193, b: 233 },
  { id: "robin-egg", name: "Robin's Egg", code: "#80-17162", hex: "#81D4FA", r: 129, g: 212, b: 250 },
  { id: "toothpaste", name: "Toothpaste", code: "#80-17129", hex: "#A9CCE3", r: 169, g: 204, b: 227 },
  { id: "sky", name: "Sky", code: "#80-17130", hex: "#5DADE2", r: 93, g: 173, b: 226 },
  { id: "pastel-blue", name: "Pastel Blue", code: "#80-17131", hex: "#B8D8F0", r: 184, g: 216, b: 240 },
  { id: "dark-blue", name: "Dark Blue", code: "#80-17132", hex: "#2E86C1", r: 46, g: 134, b: 193 },
  { id: "blueberry", name: "Blueberry", code: "#80-17163", hex: "#1F618D", r: 31, g: 97, b: 141 },
  { id: "cobalt", name: "Cobalt", code: "#80-17133", hex: "#2460A7", r: 36, g: 96, b: 167 },
  { id: "navy", name: "Navy", code: "#80-17134", hex: "#1B3A5C", r: 27, g: 58, b: 92 },

  // Teals & Greens
  { id: "turquoise", name: "Turquoise", code: "#80-17135", hex: "#48C9B0", r: 72, g: 201, b: 176 },
  { id: "shamrock", name: "Shamrock", code: "#80-17164", hex: "#16A085", r: 22, g: 160, b: 133 },
  { id: "mint", name: "Mint", code: "#80-17136", hex: "#D1F2EB", r: 209, g: 242, b: 235 },
  { id: "kiwi-lime", name: "Kiwi Lime", code: "#80-17137", hex: "#A2D149", r: 162, g: 209, b: 73 },
  { id: "bright-green", name: "Bright Green", code: "#80-17138", hex: "#2ECC71", r: 46, g: 204, b: 113 },
  { id: "parrot-green", name: "Parrot Green", code: "#80-17139", hex: "#27AE60", r: 39, g: 174, b: 96 },
  { id: "dark-green", name: "Dark Green", code: "#80-17140", hex: "#1D8348", r: 29, g: 131, b: 72 },
  { id: "evergreen", name: "Evergreen", code: "#80-17141", hex: "#145A32", r: 20, g: 90, b: 50 },
  { id: "olive", name: "Olive", code: "#80-17142", hex: "#808000", r: 128, g: 128, b: 0 },
  { id: "sage", name: "Sage", code: "#80-17165", hex: "#ABB2B9", r: 171, g: 178, b: 185 },
  { id: "prickly-pear", name: "Prickly Pear", code: "#80-17143", hex: "#C6D840", r: 198, g: 216, b: 64 },
  { id: "pastel-green", name: "Pastel Green", code: "#80-17144", hex: "#B0E8B0", r: 176, g: 232, b: 176 },

  // Browns & Earth
  { id: "sand", name: "Sand", code: "#80-17145", hex: "#EDBB99", r: 237, g: 187, b: 153 },
  { id: "tan", name: "Tan", code: "#80-17146", hex: "#D2B48C", r: 210, g: 180, b: 140 },
  { id: "fawn", name: "Fawn", code: "#80-17147", hex: "#C49A6C", r: 196, g: 154, b: 108 },
  { id: "light-brown", name: "Light Brown", code: "#80-17148", hex: "#A04000", r: 160, g: 64, b: 0 },
  { id: "brown", name: "Brown", code: "#80-17149", hex: "#6E2C00", r: 110, g: 44, b: 0 },
  { id: "cocoa", name: "Cocoa", code: "#80-17150", hex: "#5C3317", r: 92, g: 51, b: 23 },

  // Grays & Blacks
  { id: "light-grey", name: "Light Grey", code: "#80-17151", hex: "#C0C0C0", r: 192, g: 192, b: 192 },
  { id: "grey", name: "Grey", code: "#80-17152", hex: "#95A5A6", r: 149, g: 165, b: 166 },
  { id: "dark-grey", name: "Dark Grey", code: "#80-17153", hex: "#7F8C8D", r: 127, g: 140, b: 141 },
  { id: "charcoal", name: "Charcoal", code: "#80-17159", hex: "#4A4A4A", r: 74, g: 74, b: 74 },
  { id: "midnight", name: "Midnight", code: "#80-17166", hex: "#1B2631", r: 27, g: 38, b: 49 },
  { id: "black", name: "Black", code: "#80-17107", hex: "#000000", r: 0, g: 0, b: 0 },

  // Glow & Striped
  { id: "glow-green", name: "Glow Green", code: "#80-17167", hex: "#BFFF00", r: 191, g: 255, b: 0 },
  { id: "neon-yellow", name: "Neon Yellow", code: "#80-17168", hex: "#FFF700", r: 255, g: 247, b: 0 },
  { id: "neon-orange", name: "Neon Orange", code: "#80-17169", hex: "#FF6700", r: 255, g: 103, b: 0 },
  { id: "neon-pink", name: "Neon Pink", code: "#80-17170", hex: "#FF2D87", r: 255, g: 45, b: 135 },
  { id: "neon-green", name: "Neon Green", code: "#80-17171", hex: "#39FF14", r: 57, g: 255, b: 20 },
];

/** Map hex -> PerlerColor for reverse lookups */
export const PERLER_COLOR_MAP = new Map<string, PerlerColor>(
  PERLER_COLORS.map((c) => [c.hex, c])
);

/** Groups for the palette UI sidebar */
export const COLOR_GROUPS: ColorGroup[] = [
  {
    label: "Whites & Creams",
    colors: PERLER_COLORS.filter((c) =>
      ["white", "cream", "pastel-yellow", "toasted-marshmallow"].includes(c.id)
    ),
  },
  {
    label: "Yellows & Golds",
    colors: PERLER_COLORS.filter((c) =>
      ["yellow", "cheddar", "gold", "honey", "butterscotch"].includes(c.id)
    ),
  },
  {
    label: "Oranges",
    colors: PERLER_COLORS.filter((c) =>
      ["orange", "apricot", "hot-coral", "tangerine", "toffee"].includes(c.id)
    ),
  },
  {
    label: "Reds",
    colors: PERLER_COLORS.filter((c) =>
      ["red", "cherry", "cranapple", "raspberry", "rust"].includes(c.id)
    ),
  },
  {
    label: "Pinks",
    colors: PERLER_COLORS.filter((c) =>
      ["pink", "bubblegum", "blush", "magenta", "flamingo", "salmon", "peach"].includes(c.id)
    ),
  },
  {
    label: "Purples",
    colors: PERLER_COLORS.filter((c) =>
      ["lavender", "orchid", "purple", "plum", "mulberry", "grape"].includes(c.id)
    ),
  },
  {
    label: "Blues",
    colors: PERLER_COLORS.filter((c) =>
      ["light-blue", "pastel-blue", "periwinkle", "robin-egg", "toothpaste", "sky", "dark-blue", "cobalt", "blueberry", "navy"].includes(c.id)
    ),
  },
  {
    label: "Greens & Teals",
    colors: PERLER_COLORS.filter((c) =>
      ["mint", "pastel-green", "prickly-pear", "kiwi-lime", "bright-green", "parrot-green", "dark-green", "evergreen", "olive", "turquoise", "shamrock"].includes(c.id)
    ),
  },
  {
    label: "Browns & Earth",
    colors: PERLER_COLORS.filter((c) =>
      ["peach", "sand", "tan", "fawn", "light-brown", "brown", "cocoa"].includes(c.id)
    ),
  },
  {
    label: "Grays & Blacks",
    colors: PERLER_COLORS.filter((c) =>
      ["light-grey", "grey", "sage", "dark-grey", "charcoal", "midnight", "black"].includes(c.id)
    ),
  },
  {
    label: "Neons & Glow",
    colors: PERLER_COLORS.filter((c) =>
      ["neon-yellow", "neon-orange", "neon-pink", "neon-green", "glow-green"].includes(c.id)
    ),
  },
];

/**
 * Lightness-weighted Euclidean distance for perceptual color matching.
 */
export function nearestPerlerColor(r: number, g: number, b: number): string {
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
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best.hex;
}
