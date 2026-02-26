"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ThemeEntry } from "@/types/theme";

function HandIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

interface ThemeCardProps {
  theme: ThemeEntry;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ThemeCard({
  theme,
  isActive,
  onClick,
  disabled,
}: ThemeCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const bgImage = theme.backgroundImages?.[0];
  const showImage = bgImage && !imgFailed;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all",
        isActive
          ? "border-accent ring-2 ring-accent/30"
          : "border-border hover:border-muted"
      )}
    >
      {/* Preview area */}
      <div
        className="relative h-24 overflow-hidden"
        style={!showImage ? { backgroundColor: theme.preview.background } : undefined}
      >
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={bgImage}
            alt={`${theme.name} background`}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-between px-4">
            <span
              className="text-sm font-medium"
              style={{ color: theme.preview.foreground }}
            >
              Aa
            </span>
            <div className="flex gap-1.5">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: theme.preview.accent }}
              />
              <div
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor: theme.preview.foreground,
                  opacity: 0.4,
                }}
              />
            </div>
          </div>
        )}

        {/* Color dots overlay */}
        <div className={cn(
          "absolute bottom-1.5 right-1.5 flex gap-1",
          showImage ? "opacity-100" : "opacity-0"
        )}>
          <div
            className="h-3 w-3 rounded-full border border-white/20"
            style={{ backgroundColor: theme.preview.background }}
          />
          <div
            className="h-3 w-3 rounded-full border border-white/20"
            style={{ backgroundColor: theme.preview.accent }}
          />
          <div
            className="h-3 w-3 rounded-full border border-white/20"
            style={{ backgroundColor: theme.preview.foreground }}
          />
        </div>

        {/* Hand icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white/0 transition-all group-hover:bg-black/30 group-hover:text-white/80">
          <HandIcon />
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between bg-surface px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {theme.name}
          </p>
          <p className="truncate text-xs text-muted">{theme.author}</p>
        </div>
        {isActive && (
          <div className="ml-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
        )}
      </div>
    </button>
  );
}

interface DefaultThemeCardProps {
  isActive: boolean;
  onClick: () => void;
}

export function DefaultThemeCard({
  isActive,
  onClick,
}: DefaultThemeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all",
        isActive
          ? "border-accent ring-2 ring-accent/30"
          : "border-border hover:border-muted"
      )}
    >
      <div className="relative flex h-24 items-center justify-between bg-[#0a0a0b] px-4">
        <span className="text-sm font-medium text-[#e5e5e5]">Aa</span>
        <div className="flex gap-1.5">
          <div className="h-4 w-4 rounded-full bg-[#7B2D8E]" />
          <div className="h-4 w-4 rounded-full bg-[#e5e5e5] opacity-40" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white/0 transition-all group-hover:bg-black/30 group-hover:text-white/80">
          <HandIcon />
        </div>
      </div>
      <div className="flex items-center justify-between bg-surface px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            Default
          </p>
          <p className="truncate text-xs text-muted">Partio</p>
        </div>
        {isActive && (
          <div className="ml-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
        )}
      </div>
    </button>
  );
}
