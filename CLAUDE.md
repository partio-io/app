# CLAUDE.md

## Project Overview

Partio App is a Next.js 16 dashboard for browsing AI agent checkpoint data stored in GitHub repos. It uses the `src/` directory layout with the App Router.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm start` — start production server

## Architecture

- **Framework**: Next.js 16 with App Router and `src/` directory
- **Auth**: NextAuth v5 beta (`src/lib/auth.ts`) with GitHub OAuth. The `auth()` wrapper is used in middleware and API routes to access the session.
- **Middleware**: `src/middleware.ts` — must live in `src/` (not the project root) because the app uses `src/app/`. Redirects unauthenticated users to `/login`.
- **Data fetching**: SWR hooks in `src/hooks/` call internal API routes under `src/app/api/github/`. API routes use Octokit with the user's GitHub access token from the session.
- **Styling**: Tailwind CSS v4 with dark theme. CSS variables defined in `src/app/globals.css`.
- **Route groups**: `(auth)` for the login page, `(dashboard)` for the authenticated layout with sidebar/topbar.
- **Plan viewer**: `react-markdown` + `remark-gfm` + `react-syntax-highlighter` renders plan markdown in `PlanViewer` component.
- **Session parsing**: `src/lib/github/session.ts` parses JSONL transcripts from the checkpoint branch, extracting messages, tool names, and token counts.
- **Checkpoint data sharding**: files are stored at `{id.slice(0,2)}/{id.slice(2)}/0/{file}` on the `partio/checkpoints/v1` branch.

## Conventions

- Path alias `@/*` maps to `src/*` (configured in `tsconfig.json`)
- Client components use `"use client"` directive; server components are the default
- API route handlers authenticate via `auth()` from `@/lib/auth` and return early with 401 if no session
- UI components live in `src/components/ui/`, layout components in `src/components/layout/`
- Types are in `src/types/`
- Checkpoint detail page uses tabbed UI (Sessions / Plan / Files)
- Checkpoint data files use ID sharding: `{checkpointId.slice(0,2)}/{checkpointId.slice(2)}/0/`

## Key Files

- `src/lib/auth.ts` — NextAuth config (GitHub provider, JWT/session callbacks)
- `src/middleware.ts` — auth redirect middleware
- `src/app/api/github/repos/route.ts` — lists repos with checkpoint counts
- `src/types/checkpoint.ts` — shared TypeScript interfaces
- `src/hooks/use-repos.ts` / `src/hooks/use-checkpoints.ts` — SWR hooks
- `src/lib/github/plan.ts` — fetches plan markdown from checkpoint branch
- `src/lib/github/session.ts` — parses JSONL session transcripts
- `src/components/ui/plan-viewer.tsx` — Markdown renderer for plans
- `src/components/ui/checkpoint-actions.tsx` — context-aware actions (copy resume cmd, download plan)
- `src/components/ui/tool-badge.tsx` — tool usage visualization
- `src/hooks/use-checkpoints.ts` — also exports `useSession`, `useDiff`, `usePlan` hooks

## Common Pitfalls

- Middleware must be at `src/middleware.ts`, not the project root — Next.js only picks it up at the same level as the `app/` directory.
- NextAuth v5 is a beta (`5.0.0-beta.30`). The `auth()` function serves as both a session getter and a middleware wrapper.
- Environment variables (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTH_SECRET`) must be set in `.env.local`.
