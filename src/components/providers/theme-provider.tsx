"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import type { AppThemeColors, AppThemeColorKey } from "@/types/theme";
import { DEFAULT_COLORS } from "@/types/theme";
import { isLightColor } from "@/lib/themes/color-utils";
import { getThemeById } from "@/lib/themes/registry";

const STORAGE_KEY = "partio-theme-id";
const COLORS_STORAGE_KEY = "partio-theme-colors";
const BG_ENABLED_KEY = "partio-bg-enabled";
const BG_URL_KEY = "partio-bg-url";

interface ThemeContextValue {
  activeThemeId: string | null;
  loading: boolean;
  backgroundEnabled: boolean;
  applyTheme: (themeId: string) => Promise<void>;
  resetTheme: () => void;
  toggleBackground: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  activeThemeId: null,
  loading: false,
  backgroundEnabled: false,
  applyTheme: async () => {},
  resetTheme: () => {},
  toggleBackground: () => {},
});

function setColorVars(colors: AppThemeColors) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(`--${key}`, value);
  }
  if (isLightColor(colors.background)) {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
}

function clearColorVars() {
  const root = document.documentElement;
  for (const key of Object.keys(DEFAULT_COLORS)) {
    root.style.removeProperty(`--${key as AppThemeColorKey}`);
  }
  root.classList.remove("light");
  root.classList.add("dark");
}

function applyWallpaper(url: string | null, enabled: boolean) {
  const body = document.body;
  const root = document.documentElement;
  if (enabled && url) {
    body.style.backgroundImage = `url("${url}")`;
    root.setAttribute("data-wallpaper", "");
  } else {
    body.style.backgroundImage = "";
    root.removeAttribute("data-wallpaper");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  // On mount: restore cached theme + wallpaper immediately
  useLayoutEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    const savedColors = localStorage.getItem(COLORS_STORAGE_KEY);
    if (savedId && savedColors) {
      try {
        const colors = JSON.parse(savedColors) as AppThemeColors;
        setColorVars(colors);
        setActiveThemeId(savedId);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(COLORS_STORAGE_KEY);
      }
    }

    const bgEnabled = localStorage.getItem(BG_ENABLED_KEY) === "true";
    const bgUrl = localStorage.getItem(BG_URL_KEY);
    setBackgroundEnabled(bgEnabled);
    setBackgroundUrl(bgUrl);
    applyWallpaper(bgUrl, bgEnabled);
  }, []);

  const applyTheme = useCallback(
    async (themeId: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/themes/${themeId}/colors`);
        if (!res.ok) throw new Error("Failed to fetch theme");
        const colors: AppThemeColors = await res.json();
        setColorVars(colors);
        localStorage.setItem(STORAGE_KEY, themeId);
        localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(colors));
        setActiveThemeId(themeId);

        // Set the new theme's background image, but preserve the user's toggle preference
        const theme = getThemeById(themeId);
        const firstBg = theme?.backgroundImages?.[0] ?? null;
        setBackgroundUrl(firstBg);
        if (firstBg) {
          localStorage.setItem(BG_URL_KEY, firstBg);
        } else {
          localStorage.removeItem(BG_URL_KEY);
        }
        const bgEnabled = localStorage.getItem(BG_ENABLED_KEY) === "true";
        applyWallpaper(firstBg, bgEnabled);
      } catch (err) {
        console.error("Failed to apply theme:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resetTheme = useCallback(() => {
    clearColorVars();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COLORS_STORAGE_KEY);
    localStorage.removeItem(BG_ENABLED_KEY);
    localStorage.removeItem(BG_URL_KEY);
    setActiveThemeId(null);
    setBackgroundEnabled(false);
    setBackgroundUrl(null);
    applyWallpaper(null, false);
  }, []);

  const toggleBackground = useCallback(() => {
    setBackgroundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(BG_ENABLED_KEY, String(next));
      applyWallpaper(backgroundUrl, next);
      return next;
    });
  }, [backgroundUrl]);

  return (
    <ThemeContext.Provider
      value={{
        activeThemeId,
        loading,
        backgroundEnabled,
        applyTheme,
        resetTheme,
        toggleBackground,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
