export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}
