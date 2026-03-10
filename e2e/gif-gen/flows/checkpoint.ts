import type { BrowserContext, Page } from "@playwright/test";
import {
  BASE_URL,
  GIF_CHECKPOINT_ID,
  GIF_OWNER,
  GIF_REPO,
  LOAD_PAUSE,
  PAUSE,
} from "../config";

/**
 * Checkpoint detail flow: navigate to a checkpoint, explore Sessions tab
 * (scroll, expand), Plan tab, and Files tab (expand diff).
 */
export async function checkpointFlow(
  page: Page,
  _context: BrowserContext
): Promise<void> {
  let checkpointUrl: string;

  if (GIF_OWNER && GIF_REPO && GIF_CHECKPOINT_ID) {
    checkpointUrl = `${BASE_URL}/${GIF_OWNER}/${GIF_REPO}/checkpoints/${GIF_CHECKPOINT_ID}`;
  } else {
    // Find a checkpoint by navigating through repos
    await page.goto(`${BASE_URL}/repositories`, { waitUntil: "networkidle" });
    await page.waitForTimeout(LOAD_PAUSE);

    // Click first repo
    const firstRow = page.locator("table tbody tr, [role='row']").first();
    await firstRow.click();
    await page.waitForTimeout(LOAD_PAUSE);

    // Go to checkpoints tab
    const checkpointsTab = page.locator("a, button").filter({ hasText: /checkpoints/i }).first();
    if (await checkpointsTab.isVisible()) {
      await checkpointsTab.click();
      await page.waitForTimeout(LOAD_PAUSE);
    }

    // Click first checkpoint
    const firstCheckpoint = page.locator("a[href*='/checkpoints/']").first();
    if (await firstCheckpoint.isVisible()) {
      await firstCheckpoint.click();
      await page.waitForTimeout(LOAD_PAUSE);
    }

    checkpointUrl = page.url();
  }

  // Navigate to the checkpoint
  await page.goto(checkpointUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(LOAD_PAUSE);

  // Sessions tab (default) — scroll through transcript
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(PAUSE);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(PAUSE);

  // Scroll back up
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(PAUSE);

  // Click Plan tab
  const planTab = page.locator("button, a").filter({ hasText: /plan/i }).first();
  if (await planTab.isVisible()) {
    await planTab.click();
    await page.waitForTimeout(LOAD_PAUSE);
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: "smooth" }));
    await page.waitForTimeout(PAUSE);
  }

  // Click Files tab
  const filesTab = page.locator("button, a").filter({ hasText: /files/i }).first();
  if (await filesTab.isVisible()) {
    await filesTab.click();
    await page.waitForTimeout(LOAD_PAUSE);
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
    await page.waitForTimeout(PAUSE);
  }
}
