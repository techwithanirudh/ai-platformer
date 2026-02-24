# Markie Implementation Plan (Snapshot)

## Goals
- App Router migration.
- Better Auth + Drizzle (Postgres/Neon).
- Sets/Levels DB model with themed sets and ordered levels.
- AI level generation + editor with streaming updates.
- Two-panel level builder (game preview + AI panel).

## Core UX
- Home = sets list.
- Create set (theme + name + description).
- Open set → list levels, create/delete, play.
- Level builder with AI edit, 4 idea chips, save, play.
- Play set progresses level-to-level and ends with “build a new level?”

## Routes
- `/login`
- `/` (sets)
- `/sets/[setId]`
- `/sets/[setId]/levels/[levelId]`
- `/play/sets/[setId]`
- `/play/levels/[levelId]`
- `/api/auth/[...all]`
- `/api/levels/ideas`
- `/api/levels/generate`
- `/api/levels/edit`

## DB Schema
- Better Auth tables (users, sessions, accounts, verifications)
- `sets`: id, userId, name, theme, description, createdAt, updatedAt
- `levels`: id, setId, title, order, levelMap (jsonb), tileset, difficulty,
  backgroundColor, hudColor, accentColor, platformTint, createdAt, updatedAt

## AI
- `level-designer` prompt for full level generation.
- `level-ideas` prompt for 4 idea chips.
- `level-editor` prompt for full JSON edits.

## Game Runtime
- `GameCanvas` listens for EventBus events.
- `set-levels` event to play ordered levels.
- `navigate` event for last-level CTA.

## Auth
- Better Auth server handler in App Router.
- OAuth with Google/GitHub.

## Env
- DATABASE_URL
- BETTER_AUTH_SECRET
- BETTER_AUTH_URL
- NEXT_PUBLIC_BASE_URL
- GOOGLE/GITHUB OAuth keys
- OPENAI_API_KEY
