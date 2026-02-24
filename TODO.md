# Markie Detailed TODO

## UX + IA
- Account page: ensure header navigation exposes `Account`, add accessible focus styles, and keep the layout consistent with the app header.
- Home (Sets) empty state: verify contrast and spacing on white backgrounds, and confirm placeholder image block looks intentional.
- Sets list rows: add visual hierarchy for set name, theme, and actions. Ensure horizontal scroll for levels has visible overflow affordance.
- Level builder: verify top game / bottom AI editor split works at multiple viewport sizes; set a sensible min-height so the editor never collapses below usable size.
- Mobile UX: confirm dialogs are scrollable and resizable panels degrade gracefully on small screens.

## Forms (React Hook Form + next-safe-action)
- Use React Hook Form for all input-driven UI:
  - Create Set dialog (done).
  - Create Level dialog (done).
  - Account display name edit (done).
  - AI edit prompt in level builder: add RHF if you want validation or submission by form semantics.
- Standardize errors: surface server errors in dialog footers; map field errors to inputs.
- Add schema constraints that match UI limits (name length, theme length).

## Account Settings
- Confirm `updateAccountAction` updates the user name and revalidates `/account` and `/`.
- Add additional account fields if needed:
  - Optional handle or display title.
  - Avatar upload (future).
- Ensure the account page pulls from the current session on refresh.

## Data + Auth
- Confirm Drizzle migrations are applied and `markie_users` updates are allowed.
- Add cascade delete for sets (already handled by FK).
- Confirm set/theme fields are non-null and description uses the theme description.

## AI Generation
- Validate level schema constraints:
  - Exactly 10 rows, 24 chars each.
  - Exactly one `@` and `!`.
  - `platformTint` required and valid hex.
- Ensure AI idea generation always returns 4 items.
- Add fallback if AI returns invalid JSON (retry / display error).

## Gameplay
- Ensure last level flow triggers the “build a new one?” CTA after final portal.
- Confirm `GameCanvas` handles `set-levels` and `load-level` events with no race conditions.
- Validate platform tint against backgrounds for visibility.

## Observability
- Add logging for AI generation failures.
- Add UI error state when level creation fails (safe action error).

## Performance
- Check large sets rendering: add `suspense` or pagination if the list grows.
- Lazy load `GameCanvas` if page load feels heavy.

## QA Checklist
- Create set → create level → edit with AI → save → play.
- Create multiple levels → play set → verify level order.
- Edit name in account settings → see updated name in header.
- Sign out → redirected to login.
