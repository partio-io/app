# Redesign Overview Top Cards

## Context

The current overview page has two top cards: a "Checkpoints (24h)" stat card (often shows 0 — not useful) and a large heatmap. The user wants a more meaningful overview section while keeping the "Recent Activity" table.

The backend already iterates through ALL checkpoint metadata to build the heatmap, so we can derive rich stats with zero additional GitHub API calls.

## New Layout

```
Greeting
[Total Checkpoints] [This Week + trend] [Avg AI Authorship %] [Active Streak]
[────────────────── Activity Heatmap (full width) ──────────────────]
Recent Activity (table — unchanged)
```

**4 stat cards** in a `grid-cols-2 sm:grid-cols-4` grid:

| Card | Value | Detail |
|------|-------|--------|
| Total Checkpoints | e.g. "142" | subtitle: "across N repos" |
| This Week | e.g. "12" | trend arrow vs previous week (green/red) |
| Avg AI Authorship | e.g. "73%" | average `agent_percent` across all checkpoints |
| Active Streak | e.g. "5 days" | consecutive days with activity |

Heatmap moves to its own full-width row below the stats grid.

## Changes

### 1. Add `OverviewStats` type — `src/types/checkpoint.ts`

```ts
export interface OverviewStats {
  total_checkpoints: number;
  active_repos: number;
  this_week: number;
  prev_week: number;
  avg_agent_percent: number;
  streak_days: number;
  top_agent: string | null;
  top_agent_count: number;
}
```

### 2. Compute stats server-side — `src/lib/github/recent-commits.ts`

After the existing `allCheckpoints` loop (which already builds the heatmap), compute stats from the same array. Add `stats: OverviewStats` to the return object. No new API calls needed.

Key computations:
- `total_checkpoints` = `allCheckpoints.length`
- `active_repos` = unique `owner/repo` count
- `this_week` / `prev_week` = checkpoints in last 7 days vs 7-14 days ago
- `avg_agent_percent` = rounded mean of all `agent_percent` values
- `streak_days` = walk backwards from today through consecutive days with heatmap entries > 0

### 3. Update hook — `src/hooks/use-recent-commits.ts`

Add `stats` to the response type and expose it from the hook return.

### 4. Enhance `StatCard` — `src/components/ui/stat-card.tsx`

Add two optional props (backward-compatible):
- `subtitle?: string` — small text below value (e.g. "across 5 repos")
- `trend?: number` — percentage change, renders up/down arrow in green/red

### 5. Create `OverviewStatsRow` — `src/components/ui/overview-stats.tsx`

New component that renders the 4-card grid. Computes the week-over-week trend percentage from `stats.this_week` and `stats.prev_week`.

### 6. Update overview page — `src/app/(dashboard)/page.tsx`

- Remove `StatCard` import, `useState`/`checkpoints24h` computation
- Add `OverviewStatsRow` component using `stats` from hook
- Move `Heatmap` to its own full-width row below stats
- Update loading skeleton to match new 4-card grid layout

## Files to modify

| File | Action |
|------|--------|
| `src/types/checkpoint.ts` | Add `OverviewStats` interface |
| `src/lib/github/recent-commits.ts` | Compute + return `stats` |
| `src/hooks/use-recent-commits.ts` | Expose `stats` from hook |
| `src/components/ui/stat-card.tsx` | Add `subtitle` and `trend` props |
| `src/components/ui/overview-stats.tsx` | **Create** — 4-card stats grid |
| `src/app/(dashboard)/page.tsx` | New layout with stats row + heatmap |

## Verification

1. `npm run build` — ensure no type errors
2. `npm run dev` — check overview page renders correctly
3. Verify: 4 stat cards show meaningful data, heatmap renders full-width below
4. Verify: "Recent Activity" table is unchanged
5. Verify: empty state still works when no checkpoints exist
6. Verify: loading skeleton matches new layout
