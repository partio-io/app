# Plan: Gray Out Stale Checkpoint Rows in Recent Activity

## Context

When an AI agent works on a repo, a checkpoint is saved with the `commit_hash` at that time. If the commit is later squashed, rebased, or force-pushed away, the SHA no longer exists on GitHub. The dashboard's Recent Activity table fetches the commit by SHA, gets a 404, and sets `commit: null`.

Currently these rows render identically to rows with valid commits — just missing the commit message and author avatar. The user wants stale rows visually dimmed to signal the commit no longer exists.

## Approach

Add a `rowClassName` prop to the `DataTable` in `recent-commits-table.tsx` that applies `opacity-40` when `item.commit` is null.

This follows an **existing pattern** — the repositories page (`app/src/app/(dashboard)/repositories/page.tsx:93`) already does:
```tsx
rowClassName={(r) => r.checkpoint_count === 0 ? "opacity-40" : ""}
```

The `DataTable` component (`app/src/components/ui/data-table.tsx:14,56`) already supports the `rowClassName` callback — no changes needed there.

## Change — `app/src/components/repo/recent-commits-table.tsx`

Add one prop to the `<DataTable>` invocation, after `onRowClick`:

```tsx
rowClassName={(item) => (item.commit === null ? "opacity-40" : "")}
```

Single file, single line added.

## Verification

1. `npm run build` — no errors
2. `/` home overview — rows with stale commits appear dimmed at 40% opacity; rows with valid commits render normally
