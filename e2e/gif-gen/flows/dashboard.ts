import type { BrowserContext, Page } from "@playwright/test";
import { BASE_URL, LOAD_PAUSE, PAUSE } from "../config";

/**
 * Dashboard overview flow: load dashboard, pause on stats, scroll through
 * heatmap and recent commits.
 */
export async function dashboardFlow(
  page: Page,
  _context: BrowserContext
): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  // Wait for dashboard content to be visible (stat cards)
  await page.waitForSelector("text=Total Checkpoints", { timeout: 15000 });
  await page.waitForTimeout(LOAD_PAUSE);

  // Pause on stat cards
  await page.waitForTimeout(PAUSE);

  // Scroll down to reveal heatmap
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(PAUSE);

  // Scroll down to recent commits
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
  await page.waitForTimeout(PAUSE);

  // Scroll back to top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(PAUSE);
}
