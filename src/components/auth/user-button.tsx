"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLoginUrl, signOut, useSession } from "@/lib/auth-client";
import { UserAvatar } from "./user-avatar";

export function UserButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: sessionData, isPending } = useSession();
  const user = sessionData?.user ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 w-10 border-2 border-border bg-secondary-background p-0 shadow-shadow"
          disabled={isPending}
          type="button"
          variant="neutral"
        >
          <UserAvatar user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <div className="px-3 py-2">
            <div className="text-sm font-heading">{user.name ?? user.email}</div>
            {user.name && (
              <div className="text-xs text-foreground/60">{user.email}</div>
            )}
          </div>
        ) : (
          <div className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-foreground/60">
            Account
          </div>
        )}

        <DropdownMenuSeparator />

        {user ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/account">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                router.refresh();
              }}
            >
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={getLoginUrl(pathname ?? "/")}>Sign in</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
