import { z } from "zod";

export const levelSchema = z.object({
  levelMap: z
    .array(z.string())
    .describe(
      "ASCII art rows. '=' grass platform, '-' steel platform, '$' coin, '%' prize box, '^' spike, '>' ghost enemy, '@' player spawn (exactly one), '!' portal exit (exactly one). All rows same length."
    ),
  tileset: z
    .enum(["jungle", "cave", "castle", "space", "lava"])
    .describe("Visual theme"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  backgroundColor: z.string().describe("CSS hex color e.g. #1a1a2e"),
  hudColor: z.string().describe("CSS hex color for HUD text"),
  accentColor: z.string().describe("CSS hex color for HUD highlights"),
  platformTint: z.string().describe("CSS hex tint for platforms"),
});

export type Level = z.infer<typeof levelSchema>;
