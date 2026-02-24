import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";

export default async function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <div className="min-h-screen bg-black">{children}</div>;
}
