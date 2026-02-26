"use client";

import { useState, useMemo } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { ThemeCard, DefaultThemeCard } from "@/components/ui/theme-card";
import { useTheme } from "@/components/providers/theme-provider";
import { themeRegistry } from "@/lib/themes/registry";
import { cn } from "@/lib/utils";

type Filter = "all" | "dark" | "light";

export default function SettingsPage() {
  const {
    activeThemeId,
    loading,
    backgroundEnabled,
    applyTheme,
    resetTheme,
    toggleBackground,
  } = useTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    return themeRegistry.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, filter]);

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Customize your dashboard theme
      </p>

      {/* ── Theme Section ──────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-foreground">Theme</h2>
        <p className="mt-1 text-sm text-muted">
          Choose from {themeRegistry.length} OMARCHY themes
        </p>

        {/* Search + filters + wallpaper toggle */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search themes..."
            className="sm:w-72"
          />
          <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  filter === f.value
                    ? "bg-accent/15 text-accent-light"
                    : "text-muted hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {activeThemeId && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
              <span className="text-sm text-muted">Wallpaper</span>
              <button
                onClick={toggleBackground}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                  backgroundEnabled ? "bg-accent" : "bg-surface-light"
                )}
                role="switch"
                aria-checked={backgroundEnabled}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform",
                    backgroundEnabled ? "translate-x-4.5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          )}
        </div>

        {/* Theme grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <DefaultThemeCard
            isActive={activeThemeId === null}
            onClick={resetTheme}
          />
          {filtered.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={activeThemeId === theme.id}
              disabled={loading}
              onClick={() => applyTheme(theme.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted">
            No themes match your search.
          </p>
        )}
      </div>
    </div>
  );
}
