"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { authAction } from "@/lib/safe-action";
import { accountSchema } from "@/lib/validators/account";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/auth";

export const updateAccountAction = authAction
  .schema(accountSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(users)
      .set({
        name: parsedInput.name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.user.id));

    revalidatePath("/account");
    revalidatePath("/");
    return { ok: true };
  });
