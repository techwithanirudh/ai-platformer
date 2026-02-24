"use server";

import { revalidatePath } from "next/cache";
import { authAction } from "@/lib/safe-action";
import { createSetSchema } from "@/lib/validators/sets";
import { db } from "@/server/db";
import { sets } from "@/server/db/schema/sets";

export const createSetAction = authAction
  .schema(createSetSchema)
  .action(async ({ parsedInput, ctx }) => {
    const id = crypto.randomUUID();

    await db.insert(sets).values({
      id,
      userId: ctx.user.id,
      name: parsedInput.name,
      theme: parsedInput.theme,
      description: parsedInput.theme,
    });

    revalidatePath("/");
    return { setId: id };
  });
