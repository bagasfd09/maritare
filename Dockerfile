# Maritare production image — Next.js 16 (App Router) + node-postgres.
#
# Two stages: `build` compiles the app with the full dependency set; `runner` is
# the runtime. The runner intentionally carries the full node_modules so the same
# image can both serve the app (`next start`, incl. sharp for image optimization)
# and apply DB migrations (`node scripts/migrate.mjs`). It's a larger image, but
# self-contained and simple to operate on a VPS; a slimmer `output: "standalone"`
# build is a future optimization.

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---- build: install all deps + compile ----
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# NEXT_PUBLIC_* are read server-side at runtime, but pass it at build time too so
# any client-inlined usage carries the correct production origin.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN pnpm build

# ---- runner: production runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Built app + the full dependency set (next start, sharp, drizzle-orm, pg).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src/lib/db ./src/lib/db

# Run as an unprivileged user.
RUN groupadd --system app && useradd --system --gid app app && chown -R app:app /app
USER app

EXPOSE 3000
CMD ["pnpm", "start"]
