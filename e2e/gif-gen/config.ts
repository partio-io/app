import path from "path";

export const BASE_URL = process.env.GIF_BASE_URL || "http://localhost:3000";

export const VIEWPORT = { width: 1280, height: 800 };

export const VIDEO_DIR = path.resolve(__dirname, "../videos");
export const OUTPUT_DIR = path.resolve(__dirname, "../../../docs/images/app");
export const STORAGE_STATE_PATH = path.resolve(
  __dirname,
  "../storage-state.json"
);

/** Default timing between actions (ms) */
export const PAUSE = 800;
/** Longer pause for letting content load */
export const LOAD_PAUSE = 1500;

/** Owner/repo to use in flows — override with GIF_OWNER and GIF_REPO env vars */
export const GIF_OWNER = process.env.GIF_OWNER || "";
export const GIF_REPO = process.env.GIF_REPO || "";
export const GIF_CHECKPOINT_ID = process.env.GIF_CHECKPOINT_ID || "";
