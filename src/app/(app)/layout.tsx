import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@/components/auth/user-button";
import { getSession } from "@/server/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-border border-b-2 bg-secondary-background px-6 py-4">
        <Link className="font-heading text-lg tracking-[0.2em]" href="/">
          MARKIE
        </Link>
        <UserButton />
      </header>
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
