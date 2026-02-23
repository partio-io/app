# Plan: Update README.md with Latest Commit Changes

## Context

The README.md was written at the initial commit and describes only the original features. Three subsequent commits added significant features (checkpoint detail redesign, plan viewer with markdown rendering, checkpoint actions/resume command). The README needs to reflect the current state of the app.

## Changes to README.md

**File:** `/Users/arvos/Tactic/workspaces/workspace-partio-app-demo/app/README.md`

### 1. Update Features section

Replace the current bullet list with an expanded set reflecting all features:

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

### 2. Update Tech Stack section

Add the new dependencies:

- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) for markdown rendering
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) for code block highlighting

### 3. Update Project Structure tree

Add new files/directories:

- `src/app/api/github/repos/[owner]/[repo]/checkpoints/[id]/diff/` — checkpoint diff API
- `src/app/api/github/repos/[owner]/[repo]/checkpoints/[id]/plan/` — checkpoint plan API
- `src/app/api/github/repos/[owner]/[repo]/checkpoints/[id]/session/` — checkpoint session API
- `src/components/ui/checkpoint-actions.tsx`
- `src/components/ui/plan-viewer.tsx`
- `src/components/ui/tool-badge.tsx`
- `src/lib/github/plan.ts`

## Verification

- Read the updated README to confirm accuracy and formatting
- Cross-check against `package.json` dependencies and `src/` directory structure
