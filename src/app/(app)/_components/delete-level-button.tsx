"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { deleteLevelAction } from "@/app/(app)/actions/levels";
import { Button } from "@/components/ui/button";

interface DeleteLevelButtonProps {
  levelId: string;
  setId: string;
}

export function DeleteLevelButton({ levelId, setId }: DeleteLevelButtonProps) {
  const router = useRouter();
  const { execute, status } = useAction(deleteLevelAction, {
    onSuccess: () => {
      router.refresh();
    },
  });

  const isDeleting = status === "executing";

  return (
    <Button
      disabled={isDeleting}
      onClick={() => execute({ levelId, setId })}
      type="button"
      variant="reverse"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
