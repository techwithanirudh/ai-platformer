import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1).max(32),
});

export type AccountInput = z.infer<typeof accountSchema>;
