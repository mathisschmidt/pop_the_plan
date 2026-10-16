# 💍 Pop the Plan

A tiny, private web app to plan a marriage proposal.

She swipes engagement rings like on Tinder (**right** = love, **left** = nope, **down** = _maybe, but…_ with a reason). You manage the ring pictures and read her verdicts from an admin dashboard. It is built for phones first.

---

## Features

**For her** (`/login` → `/rings`)

- Signs in by answering **a riddle you wrote** (the answer is the access code). Case, accents and punctuation are ignored, so `Café de Flore!` matches `cafe de flore`.
- Swipes through the rings she has not reviewed yet: drag gestures, buttons, or arrow keys.
- On her first visit, a short **tour** shows each gesture with an animated mini-card. Afterwards, the **?** button in the header opens a one-page reminder. "Already seen" is remembered per device in `localStorage`; if storage isn't available, the tour just shows again.
- "Maybe, but…" opens a bottom sheet with quick suggestions and a free-text reason (required).

**For you** (`/admin`)

- **Overview**: counts per verdict, her access status, and a _preview_ of her experience (your swipes there are never saved).
- **Rings**: filter by _to review / love / nope / maybe_, read the "maybe" reasons, send a ring back for review, delete it, open its source link.
- **Add a ring** from your phone gallery or from an image URL, then **crop / zoom / rotate** it. Every picture is normalised to the same format: **1080×1350 WebP (4:5)**.
- **Settings**: change your password, set or change her riddle and code, sign her out, or close her access.

## Stack

| Concern   | Choice                                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Framework | SvelteKit 3 (Svelte 5 runes), `adapter-node`                                                                                  |
| Styling   | Tailwind CSS 4 (`@tailwindcss/forms`), self-hosted Fraunces + Inter                                                           |
| Database  | SQLite via `better-sqlite3` + Drizzle ORM (migrations with `drizzle-kit`)                                                     |
| Images    | [`svelte-easy-crop`](https://github.com/ValentinH/svelte-easy-crop) (MIT) for cropping, `sharp` for server-side normalisation |
| Auth      | Node `crypto.scrypt` hashes, opaque session tokens (SHA-256 stored), HTTP-only cookies                                        |
| Quality   | TypeScript strict, Vitest, ESLint, Prettier, `svelte-check`                                                                   |

> **Why `svelte-easy-crop`?** It is the Svelte port of the popular `react-easy-crop`. It supports Svelte 5, is MIT-licensed and handles touch pan and pinch-zoom out of the box, so there was no reason to switch to React.

## Getting started

Requirements: **Node ≥ 22.12** (developed on 24).

```bash
npm install
cp .env.example .env          # then set ADMIN_DEFAULT_PASSWORD
npm run dev -- --host         # --host lets you open it from your phone on the same Wi-Fi
```

On first start, the SQLite file at `DATABASE_PATH` does not exist yet. The app then:

1. creates it and applies the migrations in `./drizzle`,
2. creates the admin with `ADMIN_DEFAULT_PASSWORD`.

Then:

1. Sign in at **`/admin/login`** with that password. A banner reminds you to change it. Do it in **Settings**.
2. In **Settings → Her secret code**, write the riddle and its answer.
3. Add a few rings.
4. Send her the link. She lands on `/login`, reads the riddle and starts swiping.

> `ADMIN_DEFAULT_PASSWORD` is used **only** when the database is created. Changing it later has no effect. To start over, stop the app and delete the `data/` folder.

## Configuration

| Variable                 | Default                  | Description                                                                    |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------ |
| `ADMIN_DEFAULT_PASSWORD` | _(required, ≥ 8 chars)_  | Admin password used when the database is first created                         |
| `DATABASE_PATH`          | `./data/pop-the-plan.db` | SQLite file (created if missing)                                               |
| `UPLOAD_DIR`             | `./data/uploads`         | Where ring pictures are stored                                                 |
| `MIGRATIONS_DIR`         | `./drizzle`              | SQL migrations applied at startup                                              |
| `ORIGIN`                 | –                        | _Production:_ the public URL (required behind a reverse proxy for CSRF checks) |
| `BODY_SIZE_LIMIT`        | `512K` (adapter default) | _Production:_ set to `5M`. Cropped uploads are about 0.3–0.6 MB                |
| `PORT` / `HOST`          | `3000` / `0.0.0.0`       | _Production:_ listening address                                                |

App variables are declared and validated in [`src/env.ts`](src/env.ts) (SvelteKit 3 `defineEnvVars`).

## Scripts

| Command               | What it does                                   |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Dev server                                     |
| `npm run build`       | Production build into `build/`                 |
| `npm start`           | Runs the build with `.env` loaded              |
| `npm test`            | Unit and integration tests (Vitest)            |
| `npm run check`       | Type-check (`svelte-check`)                    |
| `npm run lint`        | Prettier + ESLint                              |
| `npm run format`      | Format everything                              |
| `npm run db:generate` | Generate a migration after editing `schema.ts` |
| `npm run db:studio`   | Browse the database with Drizzle Studio        |

## Architecture

```
src/
├── env.ts                      # Env var declarations + validation
├── hooks.server.ts             # Session resolution + central access control + security headers
├── lib/
│   ├── domain/                 # Pure, shared (server + browser) rules & types. No I/O.
│   │   ├── ring.ts             #   verdicts, statuses, image format, verdict validation
│   │   └── auth.ts             #   roles, guest-code normalisation, limits
│   ├── server/                 # Server-only (SvelteKit forbids importing it client-side)
│   │   ├── container.ts        #   Composition root: reads env, wires everything, lazy singleton
│   │   ├── db/                 #   Drizzle schema + connection/migration
│   │   ├── auth/               #   access policy, sessions, auth service, cookie & login helpers
│   │   ├── rings/              #   repository, service, image normalisation, remote fetch
│   │   ├── settings/           #   singleton settings repository
│   │   ├── storage/            #   file storage for pictures
│   │   ├── security/           #   password hashing, rate limiter
│   │   └── testing/            #   test fixtures (in-memory DB, temp dirs)
│   ├── client/                 # Browser-only helpers (canvas crop/rotate)
│   └── components/             # UI: ui/ (primitives), rings/ (swipe), admin/
└── routes/
    ├── login/                  # Her riddle login
    ├── rings/                  # Swipe deck + POST /rings/[id]/verdict
    ├── media/rings/[id]/       # Authenticated image serving
    ├── logout/
    └── admin/
        ├── login/
        └── (app)/              # Everything behind the admin layout (nav bar)
            ├── rings/          #   list/filter/delete/reset, new/ (add+crop), remote/ (URL proxy)
            └── settings/
```

**Layering rules**

- `domain/` has no dependencies and is shared by both sides, so validation rules exist only once.
- Routes are thin: parse input, call a service, map the result to HTTP or form responses.
- Services hold the business logic and receive their dependencies through constructors, so they are tested against an in-memory SQLite and temp directories without mocks.
- `container.ts` is the only module that reads env vars or creates concrete instances.

**Key decisions**

- **Access control lives in `hooks.server.ts`** via a declarative policy (`server/auth/access.ts`), not in layout `load` functions, because those do not protect form actions or endpoints.
- **Image pipeline**: the browser crops (canvas → JPEG, which every mobile browser can encode), then the server re-encodes with `sharp` to the canonical **1080×1350 WebP** and strips metadata. The server never trusts the client's format.
- **Remote images** go through an admin-only proxy (`/admin/rings/remote`), because a canvas cannot export cross-origin images. It accepts only http(s) URLs, checks that the response is an image, and enforces a size limit and a timeout.
- **One verdict per ring**: the update only applies while the ring is `pending`, so a double tap or a second device gets a `409`. The admin can send a ring back to review.
- **Pictures are private**: `/media/**` requires a session, and responses are `Cache-Control: private, immutable` (ids are never reused).

## Data model

```
app_settings (singleton id=1)  admin_password_hash, admin_password_is_default, guest_code_hash, guest_hint
sessions                       id = sha256(token), role ∈ {admin, guest}, expires_at
rings                          id (uuid), status ∈ {pending, like, dislike, maybe}, reason (iff maybe), source_url, created_at, decided_at
```

The database enforces the invariants with CHECK constraints (singleton row, valid enums, `reason` present only for `maybe`).

## Security notes

- Passwords and her code are hashed with scrypt (`N=2^15, r=8, p=1`, random salt). Sessions are random 256-bit tokens, and only their SHA-256 is stored.
- Login attempts are rate-limited (10 per 15 min per IP and role). The limiter is in memory, which is fine for a single instance.
- Changing the admin password signs out the other admin sessions. Changing her code signs her out everywhere.
- SvelteKit's built-in CSRF origin check protects the form actions. The JSON verdict endpoint requires a CORS preflight, so other origins cannot call it.
- `X-Frame-Options`, `nosniff`, `Referrer-Policy` and `Permissions-Policy` headers are set on every response, and `noindex` is set for search engines.

## Deployment

It is a plain Node server with a SQLite file. Any small VPS or home server works.

### Docker / Portainer

`Dockerfile` + `docker-compose.yml` at the root, and nothing else. The app applies its migrations and seeds the admin at boot, so a deploy is build and restart.

- **Portainer**: create a stack from the **Git repository** (build method "Repository", not the web editor: a pasted compose file has no source tree to build). Under Environment, set `ORIGIN` (required, e.g. `https://pop.example.com` or `http://192.168.1.20:3000`) and `ADMIN_DEFAULT_PASSWORD` (first boot only, min. 8 characters).
- **Plain compose**: `cp .env.production.example .env`, edit it, then `docker compose up -d --build`.

The database and the pictures live on the `pop-the-plan-data` volume (`/data`). The app serves plain HTTP on port 3000 (`HOST_PORT` / `BIND_ADDRESS` change how it is published); put your own HTTPS proxy in front. `GET /health` is the container health check.

### Without Docker

```bash
npm ci && npm run build
# .env with ADMIN_DEFAULT_PASSWORD, ORIGIN=https://your.domain, BODY_SIZE_LIMIT=5M
npm start
```

- Put it behind HTTPS (Caddy, nginx, Traefik…). Cookies are `Secure` outside localhost.
- **Persist and back up `data/`** (database + pictures).
- Keep `drizzle/` next to the build (or point `MIGRATIONS_DIR` to it). Migrations run at startup.
- Use a single instance (in-memory rate limiter, SQLite).

## Testing

```bash
npm test
```

The tests cover domain rules, the access policy, password hashing, the rate limiter, swipe gesture maths, image normalisation, remote fetching, and full service flows (auth, sessions, ring lifecycle) against a real in-memory SQLite.
