"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { sets } from "@/server/db/schema/sets";

const createSetSchema = z.object({
  name: z.string().min(1).max(64),
  theme: z.string().min(1),
  description: z.string().optional(),
});

export async function createSet(formData: FormData) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const parsed = createSetSchema.safeParse({
    name: formData.get("name"),
    theme: formData.get("theme"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return;
  }

  const id = crypto.randomUUID();

  await db.insert(sets).values({
    id,
    userId: session.user.id,
    name: parsed.data.name,
    theme: parsed.data.theme,
    description: parsed.data.description,
  });

  revalidatePath("/");
  redirect(`/sets/${id}`);
}
