import type { BrowserContext, Page } from "@playwright/test";
import { BASE_URL, LOAD_PAUSE, PAUSE } from "../config";

/**
 * Repositories flow: navigate to repos, search, toggle filter, click into a repo.
 */
export async function repositoriesFlow(
  page: Page,
  _context: BrowserContext
): Promise<void> {
  await page.goto(`${BASE_URL}/repositories`, { waitUntil: "networkidle" });
  await page.waitForTimeout(LOAD_PAUSE);

  // Type in the search box
  const searchInput = page.locator('input[type="text"], input[type="search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.click();
    await page.waitForTimeout(PAUSE / 2);
    await searchInput.fill("partio");
    await page.waitForTimeout(PAUSE);
    await searchInput.clear();
    await page.waitForTimeout(PAUSE / 2);
  }

  // Toggle to show all repos
  const toggleButton = page.locator("button").filter({ hasText: /all repo/i }).first();
  if (await toggleButton.isVisible()) {
    await toggleButton.click();
    await page.waitForTimeout(PAUSE);
    // Toggle back
    await toggleButton.click();
    await page.waitForTimeout(PAUSE);
  }

  // Click the first repo row
  const firstRow = page.locator("table tbody tr, [role='row']").first();
  if (await firstRow.isVisible()) {
    await firstRow.click();
    await page.waitForTimeout(LOAD_PAUSE);
  }
}
