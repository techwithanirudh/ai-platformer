import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Platformer",
  description: "Describe a level. Play it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}
