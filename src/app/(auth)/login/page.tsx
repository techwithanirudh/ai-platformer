import { SignInCard } from "./_components/sign-in-card";

interface LoginPageProps {
  searchParams?: Promise<{
    redirectTo?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const redirectTo = (() => {
    const value = Array.isArray(params?.redirectTo)
      ? params.redirectTo[0]
      : params?.redirectTo;

    if (typeof value !== "string") {
      return "/";
    }

    const candidate = value.trim();

    return candidate.startsWith("/") && !candidate.startsWith("//")
      ? candidate
      : "/";
  })();

  return <SignInCard redirectTo={redirectTo} />;
}
