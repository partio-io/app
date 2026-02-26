import type { AppThemeColors } from "@/types/theme";
import { lightenColor, darkenColor, mixColors } from "./color-utils";

type ColorFormat = "colors-toml" | "alacritty-toml" | "ghostty";

export function mapToAppColors(
  raw: Record<string, string>,
  format: ColorFormat
): AppThemeColors {
  if (format === "alacritty-toml") {
    return mapAlacrittyColors(raw);
  }
  // colors-toml and ghostty use the same key structure (colorN, background, foreground)
  return mapOfficialColors(raw);
}

function mapOfficialColors(raw: Record<string, string>): AppThemeColors {
  const bg = raw.background || "#0a0a0b";
  const fg = raw.foreground || "#e5e5e5";
  const accent = raw.accent || raw.color4 || "#7B2D8E";
  const surface = raw.color0 || darkenColor(bg, 5);
  const surfaceLight = raw.color8 || lightenColor(bg, 8);

  return {
    background: bg,
    foreground: fg,
    muted: raw.color7 || lightenColor(fg, -30),
    accent,
    "accent-light": lightenColor(accent, 15),
    "accent-dark": darkenColor(accent, 20),
    surface,
    "surface-light": surfaceLight,
    border: mixColors(surface, surfaceLight),
    success: raw.color2 || "#22c55e",
    warning: raw.color3 || "#eab308",
    "accent-orange": raw.color11 || raw.color3 || "#d97706",
  };
}

function mapAlacrittyColors(raw: Record<string, string>): AppThemeColors {
  const bg = raw["primary.background"] || "#0a0a0b";
  const fg = raw["primary.foreground"] || "#e5e5e5";
  const accent = raw["normal.blue"] || "#7B2D8E";
  const surface = raw["normal.black"] || darkenColor(bg, 5);
  const surfaceLight = raw["bright.black"] || lightenColor(bg, 8);

  return {
    background: bg,
    foreground: fg,
    muted: raw["normal.white"] || lightenColor(fg, -30),
    accent,
    "accent-light": lightenColor(accent, 15),
    "accent-dark": darkenColor(accent, 20),
    surface,
    "surface-light": surfaceLight,
    border: mixColors(surface, surfaceLight),
    success: raw["normal.green"] || "#22c55e",
    warning: raw["normal.yellow"] || "#eab308",
    "accent-orange": raw["bright.yellow"] || raw["normal.yellow"] || "#d97706",
  };
}
