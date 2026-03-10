# Plan: Fix Dashboard Overview GIF Generation

## Context

The `dashboard-overview.gif` only shows the login screen instead of the actual dashboard. The other GIFs (repositories, settings, etc.) work correctly. The root cause is twofold:

1. **Auth check is recorded in the video.** The orchestrator (`generate-gifs.ts`) creates a recording context, then navigates to `BASE_URL` to check auth — this navigation gets captured in the video. For other flows this is a brief blip (they quickly navigate to `/repositories`, `/settings`, etc.), but the dashboard flow navigates to the same `/` URL, making the auth check portion more prominent.

2. **Dashboard flow doesn't wait for content.** It uses `waitUntil: "networkidle"` + a timeout, but doesn't verify that dashboard-specific content (stat cards, greeting) is actually visible. If the session is expired or loading is slow, the recording captures the wrong state.

## Changes

### 1. `app/e2e/gif-gen/generate-gifs.ts` — Move auth check before recording

Move the auth check into a separate non-recording context so it never appears in the video. After confirming auth is valid, close that context and proceed with the per-flow recording contexts.

```typescript
// Before the flow loop, check auth in a non-recording context
const authContext = await browser.newContext({
  storageState: STORAGE_STATE_PATH,
  viewport: VIEWPORT,
});
const authPage = await authContext.newPage();
await authPage.goto(BASE_URL, { waitUntil: "networkidle" });
if (authPage.url().includes("/login")) {
  console.error("Session expired. Run `npm run gif:auth` to re-authenticate.");
  await authContext.close();
  await browser.close();
  process.exit(1);
}
await authContext.close();
```

Then remove the auth check from inside the per-flow loop (lines 104-113).

### 2. `app/e2e/gif-gen/flows/dashboard.ts` — Wait for dashboard content

After navigating to `BASE_URL`, wait for a dashboard-specific selector to confirm the page has loaded before proceeding with the scroll actions. The dashboard renders stat card labels like "Total Checkpoints" once data loads.

```typescript
await page.goto(BASE_URL, { waitUntil: "networkidle" });

// Wait for dashboard content to be visible (stat cards or greeting)
await page.waitForSelector('text=Total Checkpoints', { timeout: 15000 });
await page.waitForTimeout(LOAD_PAUSE);
```

## Files to Modify

- `app/e2e/gif-gen/generate-gifs.ts` — extract auth check to non-recording context
- `app/e2e/gif-gen/flows/dashboard.ts` — add `waitForSelector` for dashboard content

## Verification

1. Ensure the app is running at `localhost:3000` and auth is set up (`npm run gif:auth`)
2. Run `GIF_ONLY=dashboard-overview npm run gif:generate` in `app/`
3. Open `docs/images/app/dashboard-overview.gif` — should show stat cards, heatmap, and recent commits (not the login screen)
