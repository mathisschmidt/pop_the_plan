# CLAUDE.md

Pop the Plan: a private, phone-first SvelteKit app. The fiancée swipes engagement rings (like / dislike / maybe + reason). The single admin manages the pictures and reads her verdicts. See README.md for features and deployment.

## Commands

```bash
npm run dev            # dev server (add `-- --host` to test on a phone)
npm test               # vitest, run once (unit + integration with in-memory SQLite)
npm run check          # svelte-check (types)
npm run lint           # prettier --check + eslint
npm run format         # prettier --write
npm run db:generate    # new migration after editing src/lib/server/db/schema.ts
```

Before calling work done, run `npm run check && npm run lint && npm test`.

## Stack specifics (read before writing code)

- **SvelteKit 3 + Svelte 5 runes** (runes forced project-wide). Use `$state`, `$derived`, `$props`, `{@render}`, and `onclick=` attributes. No stores and no `export let`.
- **Imports**: use `#lib/...` (package.json `imports`, not `$lib`). **TS files need the explicit `.ts` extension**: `#lib/domain/ring.ts`. Relative imports inside `src/lib` stay extensionless.
- **Env**: declared and validated in `src/env.ts` (`defineEnvVars`). Import from `$app/env/private`, **only in `src/lib/server/container.ts`**.
- **Type imports moved**: `Handle` comes from `@sveltejs/kit/hooks`, and `SubmitFunction` from `$app/forms`.
- **Links**: ESLint requires `resolve()` from `$app/paths`. Pass **route ids**, including the group: `resolve('/admin/(app)/settings')`, `resolve(\`/admin/(app)/rings?status=${s}\`)`.
- **Tailwind 4**: tokens live in `src/routes/layout.css` (`@theme`). Reusable classes (`btn-primary`, `panel`, `input`, `label`…) are `@utility` blocks, not `@layer components`.

## Architecture rules

```
lib/domain/   pure, shared client+server: types, constants, validation. No I/O, no deps.
lib/server/   server-only. Services get deps via constructor; container.ts wires them.
lib/client/   browser-only helpers (canvas).
lib/components/{ui,rings,admin}/
routes/       thin: parse input → call service → map to HTTP / fail() / redirect.
```

- Get services with `await getServices()` (lazy singleton). Never instantiate repositories in routes.
- Business rules go in services or `domain/`, not in `+page.server.ts`. Validation shared with the UI belongs in `domain/`.
- **Access control is centralised** in `lib/server/auth/access.ts` (prefix rules) and enforced in `hooks.server.ts`. When you add a protected area, add a rule there and a test in `access.spec.ts`. Do not rely on layout `load` guards, because they do not protect actions or endpoints.
- Roles: `admin` (single account, password) and `guest` (her, code + riddle). The admin can view `/rings` in preview mode, but the verdict endpoint rejects admin votes (403).
- Every ring picture is normalised server-side to `RING_IMAGE` (1080×1350 WebP) by `normalizeRingImage`. The client crops to JPEG first. Keep the server as the source of truth.
- Pictures are served only through `/media/rings/[id]` (auth required). Storage keys are generated (uuid), never user-provided.

## Database

- Drizzle + better-sqlite3. Schema: `src/lib/server/db/schema.ts`. Migrations: `drizzle/`, applied automatically at startup by `openDatabase`.
- After changing the schema, run `npm run db:generate` and commit the new SQL. **Never edit an already-generated migration.**
- First run (empty DB): `container.ts` seeds `app_settings` with `ADMIN_DEFAULT_PASSWORD` and `adminPasswordIsDefault = true`.
- The DB enforces invariants with CHECK constraints (e.g. `reason` present iff `status = 'maybe'`). Keep them in sync with `domain/ring.ts`.

## Testing

- Co-locate tests as `*.spec.ts`. Integration tests use `testDb()` / `tempDir()` from `lib/server/testing/fixtures.ts` (real in-memory SQLite plus the real migrations), so mocks are not needed.
- Inject time (`now`) and `fetch` instead of mocking globals (see `SessionService`, `fetchRemoteImage`).
- Vitest is configured with `requireAssertions`.

## UI / design

- Phone-only usage: design for ~390px wide, `max-w-md` container, safe-area insets, `h-dvh`, and touch targets ≥ 40px.
- Palette: warm ivory background (`ivory`/`pearl`, never pure white pages), `ink` text, a single accent `rose` (rose gold) plus `champagne`. Verdict colours: love = rose, nope = taupe, maybe = champagne. Serif (`font-serif`, Fraunces) for titles and quotes, Inter for everything else.
- Keep it modern and simple: few elements, generous spacing, no heavy decoration.
- Per-device UI flags (e.g. swipe tour seen) go through `localFlag` in `lib/client/storage.ts`, which never throws. Never store important state there.
- Feedback: `toast()` from `#lib/components/ui/Toast.svelte`. Form messages: `FormMessage.svelte`.
