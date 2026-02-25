export interface ThemeEntry {
  id: string;
  name: string;
  type: "dark" | "light";
  source: "official" | "community";
  author: string;
  colorFileUrl: string;
  colorFormat: "colors-toml" | "alacritty-toml" | "ghostty";
  previewImageUrl?: string;
  backgroundImages?: string[];
  preview: {
    background: string;
    foreground: string;
    accent: string;
  };
}

export interface AppThemeColors {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  "accent-light": string;
  "accent-dark": string;
  surface: string;
  "surface-light": string;
  border: string;
  success: string;
  warning: string;
  "accent-orange": string;
}

export type AppThemeColorKey = keyof AppThemeColors;

export const DEFAULT_COLORS: AppThemeColors = {
  background: "#0a0a0b",
  foreground: "#e5e5e5",
  muted: "#a1a1aa",
  accent: "#7B2D8E",
  "accent-light": "#9B4DB0",
  "accent-dark": "#5E1F6E",
  surface: "#111113",
  "surface-light": "#1a1a1e",
  border: "#27272a",
  success: "#22c55e",
  warning: "#eab308",
  "accent-orange": "#d97706",
};
