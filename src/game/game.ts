import kaplay from "kaplay";
import type { Level } from "@/lib/level-schema";
import { EventBus } from "./EventBus";

// ── Constants ──────────────────────────────────────────────────────────────────

const JUMP_FORCE = 1320;
const MOVE_SPEED = 480;
const FALL_DEATH = 2400;

const LEVELS = [
  [
    "    0       ",
    "   --       ",
    "       $   ",
    " %    ===   ",
    "            ",
    "   ^^  > = @",
    "============",
  ],
  [
    "                          $",
    "                          $",
    "                          $",
    "                          $",
    "                          $",
    "           $         =   $",
    "  %      ====         =   $",
    "                      =   $",
    "                      =    ",
    "       ^^      = >    =   @",
    "===========================",
  ],
  [
    "     $    $    $    $     $",
    "     $    $    $    $     $",
    "                           ",
    "                           ",
    "                           ",
    "                           ",
    "                           ",
    " ^^^^>^^^^>^^^^>^^^^>^^^^^@",
    "===========================",
  ],
];

// ── Entry point ────────────────────────────────────────────────────────────────

export function StartGame(canvas: HTMLCanvasElement) {
  const k = kaplay({
    canvas,
    width: 960,
    height: 540,
    stretch: true,
    letterbox: true,
    background: [141, 183, 255],
    narrowPhaseCollisionAlgorithm: "sat",
    broadPhaseCollisionAlgorithm: "grid",
    global: false,
    debug: process.env.NODE_ENV === "development",
  });

  // Assets
  k.loadSprite("bean", "/sprites/bean.png");
  k.loadSprite("bag", "/sprites/bag.png");
  k.loadSprite("ghosty", "/sprites/ghosty.png");
  k.loadSprite("spike", "/sprites/spike.png");
  k.loadSprite("grass", "/sprites/grass.png");
  k.loadSprite("steel", "/sprites/steel.png");
  k.loadSprite("prize", "/sprites/jumpy.png");
  k.loadSprite("apple", "/sprites/apple.png");
  k.loadSprite("portal", "/sprites/portal.png");
  k.loadSprite("coin", "/sprites/coin.png");
  k.loadSound("coin", "/sounds/score.mp3");
  k.loadSound("powerup", "/sounds/powerup.mp3");
  k.loadSound("blip", "/sounds/blip.mp3");
  k.loadSound("hit", "/sounds/hit.mp3");
  k.loadSound("portal", "/sounds/portal.mp3");

  k.setGravity(3200);

  // ── Scenes ─────────────────────────────────────────────────────────────────

  k.scene("mainMenu", mainMenu);

  k.scene(
    "game",
    (data: { levelId?: number; coins?: number; aiLevel?: Level } = {}) =>
      game(data)
  );

  k.scene("lose", (data: { levelId?: number; coins?: number } = {}) =>
    lose(data)
  );

  k.scene("win", (data: { coins?: number } = {}) => win(data));

  // React → Kaplay bridge
  EventBus.on("load-level", (level: Level) => {
    k.go("game", { aiLevel: level, coins: 0 });
  });

  k.onLoad(() => k.go("mainMenu"));

  return k;

  // ── Main Menu ───────────────────────────────────────────────────────────────

  function mainMenu() {
    k.add([k.rect(k.width(), k.height()), k.color(141, 183, 255), k.pos(0, 0)]);

    k.add([
      k.rect(k.width(), 80),
      k.pos(0, k.height() - 80),
      k.color(34, 139, 34),
    ]);

    k.add([
      k.sprite("bean"),
      k.pos(k.width() / 2, k.height() - 80),
      k.scale(3),
      k.anchor("bot"),
    ]);

    for (let i = 0; i < 5; i++) {
      k.add([
        k.sprite("coin"),
        k.pos(120 + i * 180, k.height() - 160),
        k.scale(1.5),
        k.anchor("bot"),
      ]);
    }

    k.add([
      k.text("AI PLATFORMER", { size: 52 }),
      k.pos(k.width() / 2, 90),
      k.anchor("center"),
      k.color(255, 220, 50),
    ]);

    k.add([
      k.text("describe your level. play it.", { size: 20 }),
      k.pos(k.width() / 2, 155),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    menuBtn("PLAY  LEVELS", k.vec2(k.width() / 2, 260), () =>
      k.go("game", { levelId: 0, coins: 0 })
    );

    menuBtn("AI  LEVEL", k.vec2(k.width() / 2, 340), () =>
      EventBus.emit("show-ai-prompt")
    );

    k.add([
      k.text("arrow keys / WASD  move    space / W  jump", { size: 14 }),
      k.pos(k.width() / 2, k.height() - 26),
      k.anchor("center"),
      k.color(200, 200, 200),
    ]);

    k.onKeyPress("f", () => k.setFullscreen(!k.isFullscreen()));
  }

  // ── Game ────────────────────────────────────────────────────────────────────

  function game({
    levelId = 0,
    coins: startCoins = 0,
    aiLevel,
  }: {
    levelId?: number;
    coins?: number;
    aiLevel?: Level;
  }) {
    const isAiLevel = !!aiLevel;

    // Custom components
    function customPatrol(speed = 60) {
      let dir = 1;
      return {
        id: "patrol",
        require: ["pos", "area"],
        add(this: any) {
          this.on("collide", (_obj: any, col: any) => {
            if (col.isLeft()) {
              dir = 1;
            } else if (col.isRight()) {
              dir = -1;
            }
          });
        },
        update(this: any) {
          this.move(speed * dir, 0);
        },
      };
    }

    function big() {
      let timer = 0;
      let isBig = false;
      let destScale = 1;
      return {
        id: "big",
        require: ["scale"],
        update(this: any) {
          if (isBig) {
            timer -= k.dt();
            if (timer <= 0) {
              destScale = 1;
              timer = 0;
              isBig = false;
            }
          }
          this.scale = this.scale.lerp(k.vec2(destScale), k.dt() * 6);
        },
        isBig() {
          return isBig;
        },
        smallify() {
          destScale = 1;
          timer = 0;
          isBig = false;
        },
        biggify(time: number) {
          destScale = 2;
          timer = time;
          isBig = true;
        },
      };
    }

    // Shared tile definitions
    const tiles = {
      "-": () => [
        k.sprite("steel"),
        k.area(),
        k.body({ isStatic: true }),
        k.offscreen({ hide: true }),
        k.anchor("bot"),
      ],
      "0": () => [
        k.sprite("bag"),
        k.area(),
        k.body({ isStatic: true }),
        k.offscreen({ hide: true }),
        k.anchor("bot"),
      ],
      $: () => [
        k.sprite("coin"),
        k.area(),
        k.pos(0, -9),
        k.anchor("bot"),
        k.offscreen({ hide: true }),
        "coin",
      ],
      "%": () => [
        k.sprite("prize"),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("bot"),
        k.offscreen({ hide: true }),
        "prize",
      ],
      "^": () => [
        k.sprite("spike"),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("bot"),
        k.offscreen({ hide: true }),
        "danger",
      ],
      "#": () => [
        k.sprite("apple"),
        k.area(),
        k.anchor("bot"),
        k.body(),
        k.offscreen({ hide: true }),
        "apple",
      ],
      ">": () => [
        k.sprite("ghosty"),
        k.area(),
        k.anchor("bot"),
        k.body(),
        customPatrol(),
        k.offscreen({ hide: true }),
        "enemy",
      ],
      // Built-in: @ = portal exit. AI: @ = player spawn marker.
      "@": isAiLevel
        ? () => [k.rect(2, 2), k.opacity(0), k.anchor("bot"), "playerSpawn"]
        : () => [
            k.sprite("portal"),
            k.area({ scale: 0.5 }),
            k.anchor("bot"),
            k.pos(0, -12),
            k.offscreen({ hide: true }),
            "portal",
          ],
      "=": () => [
        k.sprite("grass"),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("bot"),
        k.offscreen({ hide: true }),
        "platform",
      ],
    };

    const levelMap = isAiLevel
      ? aiLevel.levelMap
      : LEVELS[levelId % LEVELS.length];
    const level = k.addLevel(levelMap, {
      tileWidth: 64,
      tileHeight: 64,
      tiles,
    });

    // Player spawn
    const spawnMarkers = level.get("playerSpawn");
    const spawnPos =
      isAiLevel && spawnMarkers.length > 0
        ? spawnMarkers[0].pos
        : k.vec2(64, 0);

    const player = k.add([
      k.sprite("bean"),
      k.pos(spawnPos),
      k.area(),
      k.scale(1),
      k.body(),
      big(),
      k.anchor("bot"),
    ]);

    for (const m of spawnMarkers) {
      k.destroy(m);
    }

    // HUD
    let coins = startCoins;

    const coinsLabel = k.add([
      k.text(`COINS: ${coins}`, { size: 24 }),
      k.pos(24, 16),
      k.fixed(),
      k.color(255, 255, 255),
    ]);

    k.add([
      k.text(isAiLevel ? "AI LEVEL" : `LEVEL ${levelId + 1}`, { size: 16 }),
      k.pos(k.width() - 16, 16),
      k.anchor("topright"),
      k.fixed(),
      k.color(200, 200, 200),
    ]);

    k.add([
      k.text("ESC  menu", { size: 12 }),
      k.pos(k.width() - 16, k.height() - 16),
      k.anchor("botright"),
      k.fixed(),
      k.color(120, 120, 120),
    ]);

    // Physics / death
    player.onUpdate(() => {
      k.setCamPos(player.pos);
      if (player.pos.y >= FALL_DEATH) {
        k.go("lose", { levelId, coins });
      }
    });

    player.onBeforePhysicsResolve((col: any) => {
      if (col.target.is(["platform", "soft"]) && player.isJumping()) {
        col.preventResolution();
      }
    });

    player.onCollide("danger", () => {
      k.go("lose", { levelId, coins });
      k.play("hit");
    });

    player.onCollide("portal", () => {
      k.play("portal");
      const next = levelId + 1;
      if (next < LEVELS.length) {
        k.go("game", { levelId: next, coins });
      } else {
        k.go("win", { coins });
      }
    });

    // Enemy stomp vs side-hit
    player.onCollide("enemy", (enemy, col) => {
      if (col?.isBottom()) {
        player.jump(JUMP_FORCE * 1.5);
        k.destroy(enemy);
        k.addKaboom(player.pos);
        k.play("powerup");
      } else {
        k.go("lose", { levelId, coins });
        k.play("hit");
      }
    });

    // Prize box → apple
    let hasApple = false;
    for (const prize of level.get("prize")) {
      prize.onHeadbutted(() => {
        if (hasApple) {
          return;
        }
        const apple = level.spawn("#", prize.tilePos.add(0, -1));
        if (apple) {
          apple.jump();
          hasApple = true;
          k.play("blip");
        }
      });
    }

    player.onCollide("apple", (apple) => {
      k.destroy(apple);
      player.biggify(3);
      hasApple = false;
      k.play("powerup");
    });

    // Coins with pitch ramp
    let coinPitch = 0;
    k.onUpdate(() => {
      if (coinPitch > 0) {
        coinPitch = Math.max(0, coinPitch - k.dt() * 100);
      }
    });

    player.onCollide("coin", (coin) => {
      k.destroy(coin);
      k.play("coin", { detune: coinPitch });
      coinPitch += 100;
      coins += 1;
      coinsLabel.text = `COINS: ${coins}`;
    });

    // Input
    function jump() {
      if (player.isGrounded()) {
        player.jump(JUMP_FORCE);
      }
    }

    k.onKeyPress("space", jump);
    k.onKeyPress("up", jump);
    k.onKeyPress("w", jump);
    k.onKeyDown("left", () => player.move(-MOVE_SPEED, 0));
    k.onKeyDown("right", () => player.move(MOVE_SPEED, 0));
    k.onKeyDown("a", () => player.move(-MOVE_SPEED, 0));
    k.onKeyDown("d", () => player.move(MOVE_SPEED, 0));
    k.onKeyPress("down", () => {
      player.gravityScale = 3;
    });
    k.onKeyRelease("down", () => {
      player.gravityScale = 1;
    });
    k.onGamepadButtonPress("south", jump);
    k.onGamepadStick("left", (v: any) => player.move(v.x * MOVE_SPEED, 0));
    k.onKeyPress("f", () => k.setFullscreen(!k.isFullscreen()));
    k.onKeyPress("escape", () => k.go("mainMenu"));
  }

  // ── Lose ────────────────────────────────────────────────────────────────────

  function lose({
    levelId = 0,
    coins = 0,
  }: {
    levelId?: number;
    coins?: number;
  }) {
    k.add([k.rect(k.width(), k.height()), k.color(20, 10, 10), k.pos(0, 0)]);

    k.add([
      k.text("YOU DIED", { size: 64 }),
      k.pos(k.width() / 2, k.height() / 2 - 80),
      k.anchor("center"),
      k.color(220, 50, 50),
    ]);

    k.add([
      k.text(`coins: ${coins}`, { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(180, 180, 180),
    ]);

    k.add([
      k.text("SPACE  retry      ESC  menu", { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2 + 80),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    k.onKeyPress("space", () => k.go("game", { levelId, coins: 0 }));
    k.onKeyPress("enter", () => k.go("game", { levelId, coins: 0 }));
    k.onKeyPress("escape", () => k.go("mainMenu"));
  }

  // ── Win ─────────────────────────────────────────────────────────────────────

  function win({ coins = 0 }: { coins?: number }) {
    k.add([k.rect(k.width(), k.height()), k.color(10, 20, 10), k.pos(0, 0)]);

    k.add([
      k.text("YOU WIN!", { size: 64 }),
      k.pos(k.width() / 2, k.height() / 2 - 80),
      k.anchor("center"),
      k.color(50, 220, 80),
    ]);

    k.add([
      k.text(`coins collected: ${coins}`, { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(200, 200, 200),
    ]);

    k.add([
      k.text("SPACE  play again      ESC  menu", { size: 20 }),
      k.pos(k.width() / 2, k.height() / 2 + 80),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    for (let i = 0; i < 8; i++) {
      k.add([
        k.sprite("coin"),
        k.pos(Math.random() * k.width(), Math.random() * k.height()),
        k.scale(1.5),
        k.anchor("center"),
      ]);
    }

    k.onKeyPress("space", () => k.go("game", { levelId: 0, coins: 0 }));
    k.onKeyPress("escape", () => k.go("mainMenu"));
  }

  // ── Button helper ───────────────────────────────────────────────────────────

  function menuBtn(
    label: string,
    position: ReturnType<(typeof k)["vec2"]>,
    onClick: () => void
  ) {
    const btn = k.add([
      k.text(label, { size: 28 }),
      k.pos(position),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.area(),
    ]);

    btn.onHover(() => {
      btn.color.r = 255;
      btn.color.g = 220;
      btn.color.b = 50;
    });
    btn.onHoverEnd(() => {
      btn.color.r = 255;
      btn.color.g = 255;
      btn.color.b = 255;
    });
    btn.onClick(onClick);

    return btn;
  }
}
