# Update README.md and CLAUDE.md

## Context

The app has grown since the docs were last written. New features were added: plan viewer, session transcript parsing, tool usage tracking, and checkpoint actions. The docs need to reflect these additions.

## Changes to README.md

### Features section — add:
- **Plan viewer** with GitHub Flavored Markdown rendering and syntax highlighting
- **Session transcript** parsed from JSONL with tool usage tracking
- **Checkpoint actions** (copy resume command, download plan)

### Tech Stack section — add:
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) for Markdown rendering
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) for code blocks
- [date-fns](https://date-fns.org/) for date formatting
- [clsx](https://github.com/lukeed/clsx) for class name composition

### Project Structure — update tree to include new files:
- `api/github/.../[id]/plan/` and `session/` routes
- `components/ui/checkpoint-actions.tsx`, `plan-viewer.tsx`, `tool-badge.tsx`
- `lib/github/plan.ts`, `lib/github/session.ts`
- `hooks/use-checkpoints.ts` now exports `useSession`, `useDiff`, `usePlan`

## Changes to CLAUDE.md

### Architecture section — add:
- **Plan viewer**: `react-markdown` + `remark-gfm` + `react-syntax-highlighter` renders plan markdown in `PlanViewer` component
- **Session parsing**: `src/lib/github/session.ts` parses JSONL transcripts from the checkpoint branch, extracting messages, tool names, and token counts
- **Checkpoint data sharding**: files are stored at `{id.slice(0,2)}/{id.slice(2)}/0/{file}` on the `partio/checkpoints/v1` branch

### Key Files section — add:
- `src/lib/github/plan.ts` — fetches plan markdown from checkpoint branch
- `src/lib/github/session.ts` — parses JSONL session transcripts
- `src/components/ui/plan-viewer.tsx` — Markdown renderer for plans
- `src/components/ui/checkpoint-actions.tsx` — context-aware actions (copy resume cmd, download plan)
- `src/components/ui/tool-badge.tsx` — tool usage visualization
- `src/hooks/use-checkpoints.ts` — now also exports `useSession`, `useDiff`, `usePlan` hooks

### Conventions section — add:
- Checkpoint detail page uses tabbed UI (Sessions / Plan / Files)
- Checkpoint data files use ID sharding: `{checkpointId.slice(0,2)}/{checkpointId.slice(2)}/0/`

## Files to modify
- `/Users/arvos/Tactic/workspaces/workspace-partio-demo/app/README.md`
- `/Users/arvos/Tactic/workspaces/workspace-partio-demo/app/CLAUDE.md`

## Verification
- Read both files after editing to confirm accuracy
- Run `npm run build` to make sure nothing was broken (docs-only change, but good sanity check)
