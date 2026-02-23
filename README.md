# Partio App

Dashboard for viewing and exploring AI agent checkpoint data stored in GitHub repositories.

## Features

- **GitHub OAuth** sign-in via NextAuth
- **Repository browser** with search and filtering (defaults to repos with checkpoints)
- **Checkpoint list** per repo (read from the `partio/checkpoints/v1` branch)
- **Checkpoint detail** with tabbed interface:
  - **Sessions** tab — transcript viewer with collapsible sessions, tool usage pills, user avatars, and merged assistant messages
  - **Plan** tab — rendered markdown with syntax-highlighted code blocks, GFM table support, copy/download actions
  - **Files** tab — commit diff viewer
- **Checkpoint actions** — contextual action cards per tab (e.g. "Resume Claude Code Session" with CLI command)
- **Overview dashboard** with stats and activity heatmap
- **Deep-linking** via `?tab=` query parameters

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, `src/` directory)
- [React](https://react.dev/) 19
- [NextAuth](https://authjs.dev/) v5 (beta) with GitHub provider
- [Octokit](https://github.com/octokit/rest.js) for GitHub API access
- [Tailwind CSS](https://tailwindcss.com/) v4
- [SWR](https://swr.vercel.app/) for data fetching
- [Framer Motion](https://www.framer.com/motion/) for animations
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) for markdown rendering
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) for code block highlighting
- TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- A GitHub OAuth App (create one at https://github.com/settings/developers)

### Environment Variables

Create a `.env.local` file:

```
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
AUTH_SECRET=<random-secret-for-nextauth>
```

Generate `AUTH_SECRET` with:

```sh
openssl rand -base64 32
```

### Install and Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. You will be redirected to the GitHub login page.

### Build

```sh
npm run build
npm start
```

## Project Structure

```
src/
  app/
    (auth)/login/         Login page
    (dashboard)/          Dashboard layout (sidebar + topbar)
      page.tsx            Overview with stats and heatmap
      repositories/       Repository list with search/filter
      [owner]/[repo]/     Checkpoint list for a repo
        [checkpointId]/   Checkpoint detail (transcript + diff)
    api/
      auth/               NextAuth route handler
      github/             GitHub API proxy routes
        repos/[owner]/[repo]/checkpoints/[id]/
          diff/           Checkpoint diff API
          plan/           Checkpoint plan API
          session/        Checkpoint session API
  components/
    layout/               Sidebar, topbar, nav items
    providers/            Session provider
    ui/                   Reusable UI components
      checkpoint-actions.tsx  Contextual action cards per tab
      plan-viewer.tsx     Markdown plan renderer
      tool-badge.tsx      Tool usage pill component
  hooks/                  SWR data-fetching hooks
  lib/
    auth.ts               NextAuth configuration
    github.ts             Octokit factory
    github/               GitHub API helpers (repos, checkpoints, diff, session, plan)
      plan.ts             Plan markdown fetching/parsing
    utils.ts              Utility functions
  middleware.ts           Auth middleware (redirects unauthenticated users to /login)
  types/                  TypeScript type definitions
```
