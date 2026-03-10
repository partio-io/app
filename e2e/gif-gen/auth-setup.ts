/**
 * One-time interactive login to save browser storage state.
 *
 * Run with: npm run gif:auth
 *
 * Opens a visible browser window at localhost:3000. Complete the GitHub OAuth
 * login manually. Once you land on the dashboard, the script saves the session
 * cookie to storage-state.json for headless runs.
 */

import { chromium } from "@playwright/test";
import { BASE_URL, STORAGE_STATE_PATH, VIEWPORT } from "./config";

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  console.log(`Opening ${BASE_URL} — please log in via GitHub...`);
  console.log("Complete the full login (including 2FA) in the browser window.");
  console.log("The script will wait until you land on the dashboard.\n");
  await page.goto(BASE_URL);

  // Wait until we're back on localhost on an authenticated page (not /login).
  // The GitHub OAuth flow navigates away from localhost entirely, so we need
  // to check both the origin and the path.
  await page.waitForURL(
    (url) => {
      const isLocalhost = url.origin === new URL(BASE_URL).origin;
      const isNotLogin = !url.pathname.includes("/login");
      return isLocalhost && isNotLogin;
    },
    { timeout: 300_000 }
  );

  // Give the session a moment to fully settle
  await page.waitForTimeout(2000);

  console.log("Authenticated! Saving storage state...");
  await context.storageState({ path: STORAGE_STATE_PATH });
  console.log(`Storage state saved to ${STORAGE_STATE_PATH}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
