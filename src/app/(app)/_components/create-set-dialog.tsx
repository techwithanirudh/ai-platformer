"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { createSetAction } from "@/app/(app)/actions/sets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createSetSchema } from "@/lib/validators/sets";

interface CreateSetDialogProps {
  trigger?: ReactNode;
}

export function CreateSetDialog({ trigger }: CreateSetDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(createSetAction, zodResolver(createSetSchema), {
      actionProps: {
        onSuccess: ({ data }) => {
          if (data?.setId) {
            setOpen(false);
            router.push(`/sets/${data.setId}`);
          }
        },
      },
      formProps: {
        defaultValues: {
          name: "",
          theme: "",
        },
      },
    });

  const { register, formState } = form;
  const isSubmitting = action.status === "executing";
  const serverError = action.result.serverError;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetFormAndAction();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="w-full" type="button">
            Create set
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-2 border-border bg-secondary-background text-foreground shadow-shadow">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Create a set
          </DialogTitle>
          <DialogDescription>
            Give your set a name and describe the theme.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmitWithAction}>
          <div className="grid gap-2">
            <label
              className="text-xs uppercase tracking-[0.2em]"
              htmlFor="name"
            >
              Name
            </label>
            <Input id="name" placeholder="Set name" {...register("name")} />
            {formState.errors.name && (
              <p className="text-red-600 text-xs">
                {formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <label
              className="text-xs uppercase tracking-[0.2em]"
              htmlFor="theme"
            >
              Theme (you describe it)
            </label>
            <Input
              id="theme"
              placeholder="Lava jungle ruins, neon space lab..."
              {...register("theme")}
            />
            {formState.errors.theme && (
              <p className="text-red-600 text-xs">
                {formState.errors.theme.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {serverError && (
              <p className="text-red-600 text-xs">{serverError}</p>
            )}
            <DialogClose asChild>
              <Button type="button" variant="neutral">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isSubmitting} type="submit">
              <span className="flex items-center gap-2">
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                )}
                {isSubmitting ? "Creating..." : "Create set"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
