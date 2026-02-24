import { notFound } from "next/navigation";
import { AccountSettings } from "@/app/(app)/account/_components/account-settings";
import { getSession } from "@/server/auth";

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
          account
        </div>
        <h1 className="font-heading text-3xl">Account settings</h1>
        <p className="mt-2 text-foreground/70 text-sm">
          Manage your profile and security details.
        </p>
      </div>
      <AccountSettings user={session.user} />
    </div>
  );
}
