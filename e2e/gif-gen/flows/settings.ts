import type { BrowserContext, Page } from "@playwright/test";
import { BASE_URL, LOAD_PAUSE, PAUSE } from "../config";

/**
 * Settings flow: search themes, filter to Dark, apply a theme, toggle wallpaper.
 */
export async function settingsFlow(
  page: Page,
  _context: BrowserContext
): Promise<void> {
  await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(LOAD_PAUSE);

  // Search for a theme
  const searchInput = page.locator('input[type="text"], input[type="search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.click();
    await page.waitForTimeout(PAUSE / 2);
    await searchInput.fill("tokyo");
    await page.waitForTimeout(PAUSE);
    await searchInput.clear();
    await page.waitForTimeout(PAUSE / 2);
  }

  // Click Dark filter
  const darkFilter = page.locator("button").filter({ hasText: /^dark$/i }).first();
  if (await darkFilter.isVisible()) {
    await darkFilter.click();
    await page.waitForTimeout(PAUSE);
  }

  // Scroll through themes
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await page.waitForTimeout(PAUSE);

  // Click a theme card (e.g., second card to apply it)
  const themeCards = page.locator("[class*='theme'], [data-theme], [role='button']");
  const cardCount = await themeCards.count();
  if (cardCount > 1) {
    await themeCards.nth(1).click();
    await page.waitForTimeout(LOAD_PAUSE);
  }

  // Scroll back up
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(PAUSE);

  // Toggle wallpaper if available
  const wallpaperToggle = page.locator("button, label").filter({ hasText: /wallpaper/i }).first();
  if (await wallpaperToggle.isVisible()) {
    await wallpaperToggle.click();
    await page.waitForTimeout(PAUSE);
  }
}
