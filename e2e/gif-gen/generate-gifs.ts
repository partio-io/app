/**
 * Main orchestrator: runs each flow, records video, converts to GIF.
 *
 * Run with: npm run gif:generate
 *
 * Prerequisites:
 *   - npm run gif:auth (one-time login)
 *   - The app running at localhost:3000
 *   - ffmpeg available on PATH
 */

import { chromium, type BrowserContext, type Page } from "@playwright/test";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  BASE_URL,
  OUTPUT_DIR,
  STORAGE_STATE_PATH,
  VIDEO_DIR,
  VIEWPORT,
} from "./config";
import { dashboardFlow } from "./flows/dashboard";
import { repositoriesFlow } from "./flows/repositories";
import { repoDetailFlow } from "./flows/repo-detail";
import { checkpointFlow } from "./flows/checkpoint";
import { settingsFlow } from "./flows/settings";

interface Flow {
  name: string;
  outputName: string;
  run: (page: Page, context: BrowserContext) => Promise<void>;
}

const flows: Flow[] = [
  { name: "Dashboard Overview", outputName: "dashboard-overview", run: dashboardFlow },
  { name: "Repositories Browse", outputName: "repositories-browse", run: repositoriesFlow },
  { name: "Repo Tabs", outputName: "repo-tabs", run: repoDetailFlow },
  { name: "Checkpoint Detail", outputName: "checkpoint-detail", run: checkpointFlow },
  { name: "Settings Themes", outputName: "settings-themes", run: settingsFlow },
];

function convertToGif(inputPath: string, outputPath: string) {
  const palettePath = inputPath.replace(/\.\w+$/, "-palette.png");

  // Pass 1: generate palette
  execSync(
    `ffmpeg -y -i "${inputPath}" -vf "fps=12,scale=1024:-1:flags=lanczos,palettegen=stats_mode=diff" "${palettePath}"`,
    { stdio: "pipe" }
  );

  // Pass 2: convert with palette
  execSync(
    `ffmpeg -y -i "${inputPath}" -i "${palettePath}" -lavfi "fps=12,scale=1024:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5" "${outputPath}"`,
    { stdio: "pipe" }
  );

  // Clean up palette
  fs.unlinkSync(palettePath);
}

async function main() {
  if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.error(
      "No storage state found. Run `npm run gif:auth` first to log in."
    );
    process.exit(1);
  }

  // Ensure output directories exist
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // Check auth in a non-recording context so it never appears in videos
  const authContext = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: VIEWPORT,
  });
  const authPage = await authContext.newPage();
  await authPage.goto(BASE_URL, { waitUntil: "networkidle" });
  if (authPage.url().includes("/login")) {
    console.error(
      "Session expired. Run `npm run gif:auth` to re-authenticate."
    );
    await authContext.close();
    await browser.close();
    process.exit(1);
  }
  await authContext.close();

  const only = process.env.GIF_ONLY;
  const toRun = only
    ? flows.filter((f) => f.outputName === only)
    : flows;

  if (only && toRun.length === 0) {
    console.error(`No flow found matching GIF_ONLY="${only}"`);
    console.error(`Available: ${flows.map((f) => f.outputName).join(", ")}`);
    process.exit(1);
  }

  for (const flow of toRun) {
    console.log(`\n--- Recording: ${flow.name} ---`);

    const flowVideoDir = path.join(VIDEO_DIR, flow.outputName);
    fs.mkdirSync(flowVideoDir, { recursive: true });

    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
      viewport: VIEWPORT,
      recordVideo: {
        dir: flowVideoDir,
        size: VIEWPORT,
      },
    });

    const page = await context.newPage();

    try {
      await flow.run(page, context);
    } catch (err) {
      console.error(`Flow "${flow.name}" failed:`, err);
    }

    await page.close();
    await context.close();

    // Find the recorded video
    const videos = fs
      .readdirSync(flowVideoDir)
      .filter((f) => f.endsWith(".webm"));
    if (videos.length === 0) {
      console.error(`No video recorded for ${flow.name}`);
      continue;
    }

    const videoPath = path.join(flowVideoDir, videos[0]);
    const gifPath = path.join(OUTPUT_DIR, `${flow.outputName}.gif`);

    console.log(`Converting ${videoPath} → ${gifPath}`);
    try {
      convertToGif(videoPath, gifPath);
      const stats = fs.statSync(gifPath);
      console.log(
        `  ✓ ${flow.outputName}.gif (${(stats.size / 1024 / 1024).toFixed(1)} MB)`
      );
    } catch (err) {
      console.error(`  ✗ ffmpeg conversion failed:`, err);
    }
  }

  await browser.close();

  // Clean up video dir
  fs.rmSync(VIDEO_DIR, { recursive: true, force: true });

  console.log("\nDone! GIFs are in docs/images/app/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
