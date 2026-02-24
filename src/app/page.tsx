"use client";

import dynamic from "next/dynamic";

// Kaplay uses browser APIs at init — cannot run on the server
const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
});

export default function Home() {
  return <GameCanvas />;
}
