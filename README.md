# Partio App

Dashboard for viewing and exploring AI agent checkpoint data stored in GitHub repositories.

## Features

- **GitHub OAuth** sign-in via NextAuth
- **Repository browser** with search and filtering
- **Checkpoint list** per repo (read from the `partio/checkpoints/v1` branch)
- **Checkpoint detail** with session transcript viewer and commit diff viewer
- **Overview dashboard** with stats and activity heatmap

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, `src/` directory)
- [React](https://react.dev/) 19
- [NextAuth](https://authjs.dev/) v5 (beta) with GitHub provider
- [Octokit](https://github.com/octokit/rest.js) for GitHub API access
- [Tailwind CSS](https://tailwindcss.com/) v4
- [SWR](https://swr.vercel.app/) for data fetching
- [Framer Motion](https://www.framer.com/motion/) for animations
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
  components/
    layout/               Sidebar, topbar, nav items
    providers/            Session provider
    ui/                   Reusable UI components
  hooks/                  SWR data-fetching hooks
  lib/
    auth.ts               NextAuth configuration
    github.ts             Octokit factory
    github/               GitHub API helpers (repos, checkpoints, diff, session)
    utils.ts              Utility functions
  middleware.ts           Auth middleware (redirects unauthenticated users to /login)
  types/                  TypeScript type definitions
```
