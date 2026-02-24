import dynamic from "next/dynamic";
import Head from "next/head";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Platformer</title>
        <meta content="Describe a level. Play it." name="description" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <main className="min-h-screen bg-background text-foreground">
        <GameCanvas />
      </main>
    </>
  );
}
