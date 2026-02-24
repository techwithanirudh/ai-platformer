"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

interface SignInCardProps {
  redirectTo: string;
}

export function SignInCard({ redirectTo }: SignInCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithProvider = async (
    provider: "google" | "github",
    callbackURL: string
  ) => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      await signIn.social({
        provider,
        callbackURL,
      });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl border-2 border-border bg-secondary-background p-8 shadow-shadow">
      <div className="mb-6">
        <div className="text-foreground/70 text-xs uppercase tracking-[0.35em]">
          welcome
        </div>
        <h1 className="mt-2 font-heading text-3xl">Markie</h1>
        <p className="mt-2 text-foreground/70 text-sm">
          An AI-powered platformer. Sign in to build your sets.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          disabled={isLoading}
          onClick={() => {
            signInWithProvider("google", redirectTo);
          }}
        >
          Continue with Google
        </Button>
        <Button
          className="w-full"
          disabled={isLoading}
          onClick={() => {
            signInWithProvider("github", redirectTo);
          }}
          variant="neutral"
        >
          Continue with GitHub
        </Button>
      </div>

      <div className="mt-6 border-border border-t-2 pt-4 text-foreground/70 text-sm">
        New here?{" "}
        <button
          className="font-heading text-foreground underline"
          onClick={() => {
            signInWithProvider("google", "/?welcome=1");
          }}
          type="button"
        >
          Create your first set
        </button>
      </div>
    </div>
  );
}
