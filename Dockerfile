# syntax=docker/dockerfile:1

# Pinned to the major the app is developed against. better-sqlite3 and sharp
# ship native binaries for a specific Node ABI, so the builder and the runtime
# must agree — change this in one place only.
ARG NODE_VERSION=24-bookworm-slim

# ---------------------------------------------------------------------------
# deps — production node_modules, including the native better-sqlite3 and sharp
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# better-sqlite3 has no prebuild for every platform and npm may fall back to
# node-gyp, which needs a toolchain.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json .npmrc ./

# Unlike cerebro-sport, do NOT add `--omit=optional`: sharp's prebuilt Linux
# binaries (@img/sharp-linux-*) are optional dependencies, and dropping them
# leaves an image that cannot process a single picture.
RUN npm ci --omit=dev

# Fail the build, not the first request, if a native module did not install.
RUN node -e "new (require('better-sqlite3'))(':memory:').exec('create table t(a)'); console.log('better-sqlite3 ok')" \
	&& node -e "require('sharp'); console.log('sharp ok')"

# ---------------------------------------------------------------------------
# build — the SvelteKit bundle
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS build
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

# Env vars are read at runtime (`$app/env/private`), so the build needs none.
RUN npm run build

# ---------------------------------------------------------------------------
# runtime — only what it takes to serve
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
	PORT=3000 \
	DATABASE_PATH=/data/pop-the-plan.db \
	UPLOAD_DIR=/data/uploads \
	MIGRATIONS_DIR=/app/drizzle \
	BODY_SIZE_LIMIT=5M

COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/build        ./build
# Migrations are applied at boot by `openDatabase`, which reads this folder.
COPY drizzle                        ./drizzle
COPY package.json                   ./package.json

# The database and the pictures live on a volume, owned by the unprivileged
# user the app runs as.
RUN mkdir -p /data && chown -R node:node /data /app
USER node

VOLUME ["/data"]
EXPOSE 3000

# No curl in a slim image, and none needed — Node has fetch.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "build/index.js"]
