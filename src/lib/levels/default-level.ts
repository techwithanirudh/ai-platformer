import type { Level } from "@/lib/level-schema";

const BASE_MAP = [
  "                        ",
  "                        ",
  "       $                ",
  "     ====               ",
  "                        ",
  "   @        ===         ",
  "                        ",
  "        $       >       ",
  "                        ",
  "========================",
];

const THEME_COLORS: Record<string, Partial<Level>> = {
  jungle: {
    backgroundColor: "#8ecae6",
    hudColor: "#0b090a",
    accentColor: "#ffb703",
  },
  cave: {
    backgroundColor: "#2b2d42",
    hudColor: "#edf2f4",
    accentColor: "#ef233c",
  },
  castle: {
    backgroundColor: "#f8f5f2",
    hudColor: "#2b2b2b",
    accentColor: "#ff7f50",
  },
  space: {
    backgroundColor: "#0b1026",
    hudColor: "#f8f8ff",
    accentColor: "#6ea8fe",
  },
  lava: {
    backgroundColor: "#2b0a0a",
    hudColor: "#fff4e6",
    accentColor: "#ff4d4d",
  },
};

export function createDefaultLevel(theme: string): Level {
  const colors = THEME_COLORS[theme] ?? THEME_COLORS.jungle;

  return {
    levelMap: [...BASE_MAP],
    tileset: (theme as Level["tileset"]) ?? "jungle",
    difficulty: "easy",
    backgroundColor: colors.backgroundColor ?? "#1a1a2e",
    hudColor: colors.hudColor ?? "#ffffff",
    accentColor: colors.accentColor ?? "#ffd24a",
    platformTint: null,
  };
}
