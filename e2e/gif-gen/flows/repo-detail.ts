import type { BrowserContext, Page } from "@playwright/test";
import { BASE_URL, GIF_OWNER, GIF_REPO, LOAD_PAUSE, PAUSE } from "../config";

/**
 * Repo detail flow: navigate through all tabs — Overview, Checkpoints,
 * Commits (change branch), PRs (filter), Code (browse files).
 */
export async function repoDetailFlow(
  page: Page,
  _context: BrowserContext
): Promise<void> {
  // Determine which repo to use
  let repoUrl: string;
  if (GIF_OWNER && GIF_REPO) {
    repoUrl = `${BASE_URL}/${GIF_OWNER}/${GIF_REPO}`;
  } else {
    // Navigate to repos and click the first one
    await page.goto(`${BASE_URL}/repositories`, { waitUntil: "networkidle" });
    await page.waitForTimeout(LOAD_PAUSE);
    const firstRow = page.locator("table tbody tr, [role='row']").first();
    await firstRow.click();
    await page.waitForTimeout(LOAD_PAUSE);
    repoUrl = page.url();
  }

  // Overview tab (default)
  await page.goto(repoUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(LOAD_PAUSE);

  // Click Checkpoints tab
  const checkpointsTab = page.locator("a, button").filter({ hasText: /checkpoints/i }).first();
  if (await checkpointsTab.isVisible()) {
    await checkpointsTab.click();
    await page.waitForTimeout(LOAD_PAUSE);
  }

  // Click Commits tab
  const commitsTab = page.locator("a, button").filter({ hasText: /commits/i }).first();
  if (await commitsTab.isVisible()) {
    await commitsTab.click();
    await page.waitForTimeout(LOAD_PAUSE);

    // Try to change branch
    const branchSelector = page.locator("select, [role='combobox']").first();
    if (await branchSelector.isVisible()) {
      await branchSelector.click();
      await page.waitForTimeout(PAUSE);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(PAUSE / 2);
    }
  }

  // Click PRs tab
  const prsTab = page.locator("a, button").filter({ hasText: /prs|pull/i }).first();
  if (await prsTab.isVisible()) {
    await prsTab.click();
    await page.waitForTimeout(LOAD_PAUSE);
  }

  // Click Code tab
  const codeTab = page.locator("a, button").filter({ hasText: /code/i }).first();
  if (await codeTab.isVisible()) {
    await codeTab.click();
    await page.waitForTimeout(LOAD_PAUSE);

    // Click into a file/folder
    const firstEntry = page.locator("table tbody tr, [role='row']").first();
    if (await firstEntry.isVisible()) {
      await firstEntry.click();
      await page.waitForTimeout(LOAD_PAUSE);
    }
  }
}
