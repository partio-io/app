# Plan: Make Overview Page Blazing Fast

## Context

The Overview page (`app/src/app/(dashboard)/page.tsx`) loads extremely slowly because a single API call to `/api/github/repos/recent-commits` triggers **~400+ GitHub API calls** with zero caching:

1. `listReposWithCheckpoints()` — 1 call to list repos + 3 calls per repo (getRef → getCommit → getTree) = **~301 calls** for 100 repos
2. `listCheckpoints()` per checkpoint repo — repeats the **same 3 tree traversal calls** that step 1 already did, then fetches every metadata blob = **~130 calls** for 10 repos with 100 checkpoints
3. Commit enrichment for top 10 = **10 calls**

Additionally: no server-side cache, and the SWR hook lacks `revalidateOnFocus: false`, so every tab-switch triggers a full re-fetch.

---

## Changes (ordered by implementation sequence)

### 1. Tune SWR hook — prevent unnecessary client re-fetches

**File:** `app/src/hooks/use-recent-commits.ts`

Add `{ revalidateOnFocus: false, dedupingInterval: 60_000 }` to the SWR call. Every other hook in the codebase already has this — this one was missed.

---

### 2. Add server-side response cache (60s TTL)

**File:** `app/src/app/api/github/repos/recent-commits/route.ts`

Add a module-level `Map<string, { data; timestamp }>` keyed by `session.user.login`. Before doing any work, check if a cached response exists within the TTL. If so, return it immediately (0 API calls). Otherwise, compute the result and store it.

- Cache key: `session.user.login` (confirmed available via `auth.ts` line 28-30)
- TTL: 60 seconds
- Effect: 2nd+ loads within 60s are instant

---

### 3. Eliminate duplicate tree traversal — halve first-load API calls

The core architectural fix. `listReposWithCheckpoints()` already fetches the full recursive tree for every repo (to count metadata files), but **discards the tree entry SHAs**. Then `listCheckpoints()` fetches the **exact same tree** again just to get those SHAs.

**Files to modify:**

**A. `app/src/lib/github/repos.ts`**
- Keep the existing tree traversal logic, but instead of only storing `checkpointCount`, also store the filtered metadata entries (`{ path, sha }[]`).
- Return them as `_metadata_entries` on each repo object (underscore prefix = internal, not part of the public API type).

**B. `app/src/app/api/github/repos/route.ts`**
- Strip `_metadata_entries` before returning JSON: `repos.map(({ _metadata_entries, ...rest }) => rest)`

**C. `app/src/lib/github/checkpoints.ts`**
- Add new function `listCheckpointsFromEntries(octokit, owner, repo, entries)` that skips the getRef → getCommit → getTree calls and directly calls `getBlob` on the provided SHAs. This is lines 36-58 of the existing `listCheckpoints()`, extracted.

**D. `app/src/lib/github/recent-commits.ts`**
- Change the `repos` parameter type to include `_metadata_entries`
- Replace `listCheckpoints(octokit, repo.owner, repo.name)` with `listCheckpointsFromEntries(octokit, repo.owner, repo.name, repo._metadata_entries)`
- Update import

**E. `app/src/app/api/github/repos/recent-commits/route.ts`** (already modified in step 2)
- Pass the full repos (with `_metadata_entries`) to `getRecentCheckpointsForRepos`

**Saves:** 3 API calls per checkpoint repo (e.g., 30 calls for 10 repos).

---

### 4. Show greeting immediately while data loads

**File:** `app/src/app/(dashboard)/page.tsx`

Move the greeting (`<h2>Morning, John</h2>`) outside the loading check so it renders instantly. Only the stats/heatmap/table sections show skeletons while loading.

---

## Impact Summary

| Scenario | Before | After |
|----------|--------|-------|
| First load (100 repos, 10 with checkpoints) | ~441 API calls, full wait | ~411 API calls, greeting shows instantly |
| Tab switch / navigation back | ~441 API calls again | 0 calls (SWR dedup + revalidateOnFocus: false) |
| Reload within 60s | ~441 API calls | 0 calls (server cache hit) |
| Reload after 60s | ~441 API calls | ~411 API calls (cache expired, but tree dedup saves 30) |

## Verification

1. `cd app && npm run build` — confirm no type errors
2. `npm run dev` — load the Overview page, check Network tab: single fetch to `/api/github/repos/recent-commits`
3. Switch tabs and back — confirm no new fetch fires
4. Reload within 60s — confirm response is near-instant (server cache hit, check with `console.log` or timing)
5. Check the repos page (`/repositories`) still works correctly (metadata entries stripped from response)
