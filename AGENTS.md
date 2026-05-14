<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Maritare — Wedding Invitation SaaS

Indonesian digital wedding invitation platform. Customers create personalized invitation websites; guests RSVP, leave messages, and view photos.

## Stack
- Next.js 16 (App Router) + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui
- PostgreSQL 16 + Drizzle ORM
- Auth.js v5 (email + Google)
- Cloudflare R2 via @aws-sdk/client-s3
- BullMQ + Redis for background jobs
- Midtrans (payment), Fonnte (WhatsApp), Resend (email)
- pnpm + Node 20

## Commands
- `pnpm dev` — start dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm typecheck` — run tsc --noEmit
- `pnpm db:generate` — generate Drizzle migrations
- `pnpm db:migrate` — apply migrations
- `pnpm db:studio` — open Drizzle Studio

## Folder structure
- `src/app/(marketing)/` — landing, pricing
- `src/app/(auth)/` — login, register
- `src/app/(dashboard)/` — authenticated customer area
- `src/app/inv/[slug]/` — public invitation pages (rendered to guests)
- `src/app/api/` — route handlers (webhooks, presigned URL signing)
- `src/components/ui/` — shadcn primitives only
- `src/components/<feature>/` — feature-specific components
- `src/lib/db/` — Drizzle schema and client
- `src/lib/<service>/` — external service clients
- `src/server/actions/` — Next.js Server Actions for form mutations
- `src/server/queue/` — BullMQ job definitions and workers

## Conventions
- TypeScript strict. No `any` without a comment explaining why.
- Server Actions for form mutations; route handlers for webhooks and presigned URL signing.
- File uploads use **presigned URLs to R2** — never proxy file bytes through the server.
- Money values in IDR stored as integers (rupiah, no decimals).
- Validate all external input with Zod at the boundary.
- shadcn components in `src/components/ui/` are our code; modify freely.
- ES modules. Prefer named exports over default.
- Tailwind utilities only in JSX. No new CSS files except `globals.css`.

## Database
- Domain-named tables: `users`, `weddings`, `guests`, `rsvps`, `wishes`, `photos`, `orders`, `packages`, `templates`.
- IDs are UUIDs.
- Every table has `created_at` and `updated_at` timestamps.
- Soft-delete via `deleted_at` on user-facing data; hard-delete on internal logs.

## User-facing language
- All Indonesian-facing copy is in Bahasa Indonesia (informal, friendly tone — "kamu" not "Anda" unless legal/formal context like terms).
- Internal errors, logs, code comments in English.

## Hard rules
- NEVER commit `.env` or anything containing secrets. `.env.example` only.
- NEVER put R2 secret keys in client-side code. Server-side signing only.
- NEVER trust client-supplied IDs in mutations — verify ownership via the session.
- NEVER auto-publish invitation pages — require an explicit customer publish action gated by paid status.
- NEVER expose Midtrans server key or Fonnte token to the client.

## When in doubt
- Ask before adding a new dependency. Optimize for small dep tree.
- Ask before creating a new top-level folder.
- Ask before designing a new database table — schema is architectural.
- Read existing similar code in this repo before inventing a new pattern.
