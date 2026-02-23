# Plan: Transform Partio into a GitHub Repository Dashboard (Better-Hub style)

## Context

Partio currently serves as a checkpoint viewer — it lists GitHub repos and lets users browse AI agent session data stored on orphan branches. The goal is to expand it into a full GitHub repository dashboard with tabs for Overview, Code, Commits, PRs, Issues, and Check-points, pulling all data from the GitHub API. The design follows the "Better-Hub" screenshot: a dark-themed repo dashboard with tab navigation, left sidebar info panel, stats bar, and three-column activity layout.

## New Dependencies

```
shiki           — Syntax highlighting for code viewer (TextMate grammars, dark themes)
react-markdown  — Render PR/Issue bodies (GitHub-Flavored Markdown)
remark-gfm      — GFM support (tables, task lists, strikethrough)
rehype-raw      — Allow raw HTML in markdown
```

## Architecture Overview

The repo detail view (`/[owner]/[repo]`) gets a **new nested layout** with horizontal tab navigation. Each tab is a sub-route. The existing checkpoint pages move under `/checkpoints/`.

```
(dashboard)/
  page.tsx                          /              (home overview — KEEP)
  repositories/page.tsx             /repositories  (repo list — KEEP)
  [owner]/[repo]/
    layout.tsx                      NEW — repo header + tab navigation
    page.tsx                        REPLACE — Overview dashboard tab
    code/
      page.tsx                      NEW — file browser (root)
      [[...path]]/page.tsx          NEW — file/dir at path
    commits/
      page.tsx                      NEW — commit history
      [sha]/page.tsx                NEW — commit detail + diff
    pulls/
      page.tsx                      NEW — PR list
      [number]/page.tsx             NEW — PR detail
    issues/
      page.tsx                      NEW — issue list
      [number]/page.tsx             NEW — issue detail
    checkpoints/
      page.tsx                      MOVE from current [owner]/[repo]/page.tsx
      [checkpointId]/page.tsx       MOVE from current [checkpointId]/page.tsx
```

**Why checkpoints move**: The current `[owner]/[repo]/[checkpointId]` dynamic segment would conflict with named segments like `code`, `commits`, etc. Moving checkpoints under a named `/checkpoints/` path resolves this.

---

## Implementation Phases

### Phase 1: Foundation

**1.1 Install dependencies**
```bash
cd app && npm install shiki react-markdown remark-gfm rehype-raw
```

**1.2 Create types** — `app/src/types/repository.ts`
- `RepoDetail` (owner, name, description, private, language, license, default_branch, stargazers_count, forks_count, watchers_count, open_issues_count, topics, homepage, size, avatar_url, html_url, pushed_at)
- `CommitSummary`, `CommitDetail`, `CommitFileChange`
- `PullRequestSummary`, `PullRequestDetail`
- `IssueSummary`, `IssueDetail`
- `Label`, `UserSummary`
- `TreeEntry`, `FileContent`
- `Contributor`, `WeeklyActivity`

**1.3 Shared fetcher** — `app/src/lib/fetcher.ts`
- Extract the duplicated `fetcher` function from hooks into one reusable export

**1.4 Extend Badge** — `app/src/components/ui/badge.tsx`
- Add `variant` prop: `"default"` | `"success"` (green/open) | `"danger"` (red/closed) | `"purple"` (merged) | `"muted"` (draft)

**1.5 Add CSS variables** — `app/src/app/globals.css`
- Add `--info: #3b82f6` (blue) and `--purple-pr: #8b5cf6` (merged purple)
- Register them in the `@theme inline` block

---

### Phase 2: Repo Detail + Tab Layout

**2.1 GitHub helper** — `app/src/lib/github/repo-detail.ts`
- `getRepoDetail(octokit, owner, repo)` → calls `octokit.repos.get()`

**2.2 API route** — `app/src/app/api/github/repos/[owner]/[repo]/route.ts`
- Same auth pattern as existing checkpoints route

**2.3 SWR hook** — `app/src/hooks/use-repo-detail.ts`

**2.4 Repo tab layout** — `app/src/app/(dashboard)/[owner]/[repo]/layout.tsx`
- Client component with `usePathname()` for active tab detection
- Repo header: avatar + `owner / repo` + Public/Private badge
- Horizontal tabs: Overview, Code, Commits, PRs (count), Issues (count), Check-points (count)
- Tab styling: reuse the existing pattern from checkpoint detail page (lines 187-229) — `border-b-2 border-accent` for active, `text-muted hover:text-foreground` for inactive

**2.5 Move checkpoints**
- Move `app/src/app/(dashboard)/[owner]/[repo]/page.tsx` → `[owner]/[repo]/checkpoints/page.tsx`
- Move `app/src/app/(dashboard)/[owner]/[repo]/[checkpointId]/page.tsx` → `[owner]/[repo]/checkpoints/[checkpointId]/page.tsx`
- Update internal links (`/${owner}/${repo}/${cp.id}` → `/${owner}/${repo}/checkpoints/${cp.id}`)
- Update breadcrumb hrefs in checkpoint detail

---

### Phase 3: Overview Tab (Dashboard)

**3.1 New GitHub helpers**
- `app/src/lib/github/contributors.ts` — `listContributors(octokit, owner, repo)`
- `app/src/lib/github/activity.ts` — `getCommitActivity(octokit, owner, repo)` using `octokit.repos.getCommitActivityStats()`
- `app/src/lib/github/pulls.ts` — `listPullRequests(octokit, owner, repo, options?)` (needed early for overview)
- `app/src/lib/github/issues.ts` — `listIssues(octokit, owner, repo, options?)` (needed early for overview)

**3.2 New API routes**
- `api/github/repos/[owner]/[repo]/contributors/route.ts`
- `api/github/repos/[owner]/[repo]/activity/route.ts`
- `api/github/repos/[owner]/[repo]/pulls/route.ts`
- `api/github/repos/[owner]/[repo]/issues/route.ts`

**3.3 New SWR hooks**
- `use-contributors.ts`, `use-activity.ts`, `use-pulls.ts`, `use-issues.ts`

**3.4 New components** — `app/src/components/repo/`
- `repo-sidebar-info.tsx` — Left panel: description, public/private badge, latest commit, topic tags, star button, quick actions (Go to file, Open on GitHub, Fork), metadata (Language, License, Branch, Last push, Size, Homepage), contributors
- `repo-stats-bar.tsx` — Stars, Forks, Watchers, Open PRs, Open Issues (reuse StatCard pattern)
- `activity-chart.tsx` — 16-week commit bar chart (SVG rects, no library needed — same approach as existing Heatmap)
- `event-feed.tsx` — Recent activity feed from GitHub events API
- `open-prs-list.tsx` — Compact PR list with avatar, title, date
- `open-issues-list.tsx` — Compact issue list with avatar, title, date
- `contributor-avatars.tsx` — Stacked avatar row with "+N" overflow

**3.5 Overview page** — `app/src/app/(dashboard)/[owner]/[repo]/page.tsx`
- Three-column layout matching screenshot:
  - Left: repo-sidebar-info
  - Main: stats bar → highlighted activity → three-column grid (Recent Activity | Open PRs | Open Issues)

---

### Phase 4: Code Tab

**4.1 GitHub helper** — `app/src/lib/github/contents.ts`
- `getContents(octokit, owner, repo, path?, ref?)` → calls `octokit.repos.getContent()`
- Returns `TreeEntry[]` for directories, `FileContent` for files

**4.2 API route** — `api/github/repos/[owner]/[repo]/contents/route.ts` + `contents/[...path]/route.ts`

**4.3 SWR hook** — `use-contents.ts`

**4.4 Components**
- `file-tree.tsx` — Directory listing table (icon, name, last commit message, date) — reuse DataTable
- `file-viewer.tsx` — File content with Shiki syntax highlighting (server-side highlight, client render)

**4.5 Pages**
- `code/page.tsx` — Root directory listing
- `code/[[...path]]/page.tsx` — Nested file/directory view

---

### Phase 5: Commits Tab

**5.1 GitHub helper** — `app/src/lib/github/commits.ts`
- `listCommits(octokit, owner, repo, options?)` → `octokit.repos.listCommits()`
- `getCommit(octokit, owner, repo, sha)` → `octokit.repos.getCommit()` (includes file diffs)

**5.2 API routes** — `commits/route.ts` + `commits/[sha]/route.ts`

**5.3 SWR hooks** — `use-commits.ts`

**5.4 Components**
- `commit-list.tsx` — Grouped by date, shows message, author avatar, SHA, relative time
- `commit-detail.tsx` — Commit info + reuse existing `DiffViewer` for file changes

**5.5 Pages** — `commits/page.tsx` + `commits/[sha]/page.tsx`

---

### Phase 6: PRs Tab

**6.1 GitHub helper** — extend `pulls.ts` with `getPullRequest(octokit, owner, repo, number)`

**6.2 API route** — `pulls/[number]/route.ts`

**6.3 SWR hook** — extend `use-pulls.ts` with `usePullRequest(owner, repo, number)`

**6.4 Shared components**
- `state-filter.tsx` — Open/Closed toggle buttons (reused by Issues too)
- `label-badge.tsx` — GitHub label with colored background
- `markdown-body.tsx` — `react-markdown` + `remark-gfm` + Shiki code blocks

**6.5 Components**
- `pr-list.tsx` — Filterable PR list with status icon, title, labels, author, date
- `pr-detail.tsx` — Full PR view with body (markdown), metadata, labels

**6.6 Pages** — `pulls/page.tsx` + `pulls/[number]/page.tsx`

---

### Phase 7: Issues Tab

**7.1 GitHub helper** — extend `issues.ts` with `getIssue(octokit, owner, repo, number)`
- Filter out PRs from `listIssues` (GitHub API includes PRs in issues endpoint)

**7.2 API route** — `issues/[number]/route.ts`

**7.3 SWR hook** — extend `use-issues.ts` with `useIssue(owner, repo, number)`

**7.4 Components** — `issue-list.tsx`, `issue-detail.tsx` (reuse state-filter, label-badge, markdown-body)

**7.5 Pages** — `issues/page.tsx` + `issues/[number]/page.tsx`

---

### Phase 8: Polish

- Add `loading.tsx` for every new route segment
- Add `error.tsx` boundary at `[owner]/[repo]/` level
- Ensure sidebar highlights "Repositories" when inside a repo view
- Handle GitHub API rate limits gracefully (SWR `dedupingInterval`, `revalidateOnFocus: false`)
- Handle the `202 Accepted` response from commit activity stats API (retry on next SWR revalidation)

---

## Key Files Modified

| File | Change |
|------|--------|
| `app/src/components/ui/badge.tsx` | Add `variant` prop |
| `app/src/app/globals.css` | Add `--info` and `--purple-pr` colors |
| `app/src/app/(dashboard)/[owner]/[repo]/page.tsx` | Replace with Overview dashboard |
| `app/src/app/(dashboard)/[owner]/[repo]/[checkpointId]/page.tsx` | Move to `checkpoints/` sub-path, update links |

## Key Files Created (~50 new files)

| Category | Files |
|----------|-------|
| Types | `types/repository.ts` |
| Lib helpers (7) | `github/repo-detail.ts`, `commits.ts`, `pulls.ts`, `issues.ts`, `contents.ts`, `contributors.ts`, `activity.ts` |
| Shared lib | `lib/fetcher.ts` |
| API routes (11) | repo detail, commits list+detail, pulls list+detail, issues list+detail, contents root+path, contributors, activity |
| SWR hooks (7) | `use-repo-detail.ts`, `use-commits.ts`, `use-pulls.ts`, `use-issues.ts`, `use-contents.ts`, `use-contributors.ts`, `use-activity.ts` |
| Pages (11) | overview, code root+path, commits list+detail, pulls list+detail, issues list+detail, checkpoints list+detail (moved) |
| Repo components (~15) | `components/repo/` — sidebar-info, stats-bar, activity-chart, event-feed, open-prs-list, open-issues-list, contributor-avatars, file-tree, file-viewer, commit-list, commit-detail, pr-list, pr-detail, issue-list, issue-detail, state-filter, label-badge, markdown-body |
| Layout (1) | `[owner]/[repo]/layout.tsx` |
| Loading states (7) | One per new route segment |

## Reused Existing Components

- `Avatar` — author/contributor avatars everywhere
- `Button` — quick actions
- `DataTable` — file tree listing
- `DiffViewer` — commit detail diffs (already handles unified diff format)
- `EmptyState` — empty tab states
- `Heatmap` — could be reused or replaced by activity-chart
- `SearchInput` — filter PRs/Issues
- `Skeleton` — all loading states
- `StatCard` — overview stats bar
- `TranscriptViewer` — checkpoint detail (stays as-is)

## Verification

1. `npm run build` — should compile with no errors
2. `npm run dev` — navigate to a repo, verify all 6 tabs load
3. Test each tab: Overview (stats + activity), Code (browse files), Commits (history + detail diffs), PRs (list + detail), Issues (list + detail), Check-points (existing functionality preserved)
4. Verify checkpoint URLs redirect or work at new paths (`/[owner]/[repo]/checkpoints/[id]`)
5. Test with both public and private repos
6. Verify loading states and empty states render correctly
