# syntax=docker/dockerfile:1.7
#
# Pop the Plan: production image.
#   docker build -t pop-the-plan .
#   docker run -p 3000:3000 -e ADMIN_DEFAULT_PASSWORD=... -v pop-the-plan-data:/data pop-the-plan
#
# Debian slim (glibc) rather than Alpine: better-sqlite3 and sharp ship prebuilt glibc binaries.

ARG NODE_VERSION=24

# ---- base -------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app

# ---- deps: full install (dev deps are needed to build) ------------------------
FROM base AS deps
# Toolchain is only a fallback, used if a native module has no prebuilt binary for the platform.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- build: compile the app, then drop dev dependencies -----------------------
FROM deps AS build
COPY . .
RUN npm run build \
	&& npm prune --omit=dev \
	# better-sqlite3 may compile from source: keep the .node binary, drop sources and objects.
	&& cd node_modules/better-sqlite3 \
	&& rm -rf deps src build/Release/obj build/Release/obj.target build/Release/.deps build/deps

# ---- runtime ------------------------------------------------------------------
FROM base AS runtime

ENV NODE_ENV=production \
	HOST=0.0.0.0 \
	PORT=3000 \
	DATABASE_PATH=/data/pop-the-plan.db \
	UPLOAD_DIR=/data/uploads \
	MIGRATIONS_DIR=/app/drizzle \
	BODY_SIZE_LIMIT=5M

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/drizzle ./drizzle

# /data holds the SQLite database and the pictures. Owned by the unprivileged `node` user (uid 1000).
RUN mkdir -p /data && chown node:node /data
VOLUME ["/data"]

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

# adapter-node handles SIGTERM gracefully (SHUTDOWN_TIMEOUT).
CMD ["node", "build"]
