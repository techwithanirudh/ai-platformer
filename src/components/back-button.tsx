"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      className="h-9 px-3 text-xs uppercase tracking-[0.2em]"
      onClick={() => router.back()}
      type="button"
      variant="neutral"
    >
      Back
    </Button>
  );
}
