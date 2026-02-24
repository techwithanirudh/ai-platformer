import EventEmitter from "eventemitter3";
import type { Level } from "@/lib/level-schema";

interface Events {
  "hide-ai-prompt": [];
  "level-ready": [];
  "load-level": [level: Level];
  "player-died": [];
  "show-ai-prompt": [];
}

export const EventBus = new EventEmitter<Events>();
