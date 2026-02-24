# Markie Implementation Plan (Detailed)

## Vision
Markie is an AI-first 2D platformer builder where **all levels are AI-generated**, grouped into themed sets, and edited in a live two-panel builder (game preview + AI editor).

## Core Decisions
- **App Router** only.
- **Better Auth + Drizzle (Postgres/Neon)** for auth/session storage.
- **next-safe-action + React Hook Form** for all user input and mutations.
- **No default/manual levels**: every level is AI-generated.
- **Level builder UI** uses a vertical resizable split (top game, bottom AI editor).

## UX Map
- **Home (/)**:
  - Empty state: full-width "Create your first set" card.
  - Sets list: each set row shows name, theme, and a horizontally scrollable list of levels.
  - "View more" navigates to set page.
  - Create set dialog (name + theme description).
- **Set (/sets/[setId])**:
  - Set header with theme badge and theme description.
  - Create level dialog (title only).
  - Levels list with open / play / delete actions.
- **Level builder (/sets/[setId]/levels/[levelId])**:
  - Resizable split: game preview on top, AI editor on bottom.
  - AI ideas chips (4).
  - Edit prompt → apply edits → save → play.
  - Color controls (background, HUD, accent, platform tint).
- **Play**:
  - `/play/sets/[setId]` plays in sequence.
  - `/play/levels/[levelId]` starts at a given level, continues forward.
  - Last level shows CTA to build a new one.
- **Account (/account)**:
  - Display avatar, name, email, created date.
  - Edit display name with RHF + safe action.

## Routes
- `/login`
- `/` (sets home)
- `/account`
- `/sets/[setId]`
- `/sets/[setId]/levels/[levelId]`
- `/play/sets/[setId]`
- `/play/levels/[levelId]`
- `/api/auth/[...all]`
- `/api/levels/ideas`
- `/api/levels/generate`
- `/api/levels/edit`

## Data Model
### Auth (Better Auth)
- users, sessions, accounts, verifications

### Sets
- `id`
- `userId`
- `name`
- `theme` (free-text description, user provided)
- `description` (theme description; currently mirrors `theme`)
- `createdAt`, `updatedAt`

### Levels
- `id`
- `setId`
- `title`
- `order`
- `levelMap` (jsonb)
- `tileset` enum
- `difficulty` enum
- `backgroundColor`, `hudColor`, `accentColor`, `platformTint`
- `createdAt`, `updatedAt`

## AI Contract
- Level schema:
  - 10 rows, 24 chars each.
  - Exactly one `@` (spawn) and one `!` (portal).
  - Required `platformTint` hex.
- Prompts:
  - `level-designer` (full level creation)
  - `level-ideas` (4 short ideas)
  - `level-editor` (full JSON edits)

## Game Runtime
- `GameCanvas` listens to EventBus:
  - `set-levels` for ordered playthrough.
  - `load-level` for single level.
  - `navigate` for last-level CTA.
- Gravity and collision parameters aligned to Kaplay defaults.

## Auth / Settings
- OAuth providers (Google/GitHub).
- Account page uses safe action to update user name.
- Header provides Account + Sign out.

## Environment
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_BASE_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `OPENAI_API_KEY`
