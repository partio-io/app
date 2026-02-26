# OMARCHY Theme Integration for Partio

## Context

The Partio dashboard currently has hardcoded dark theme colors in CSS variables (`globals.css`). The user wants to let users pick from the 60+ OMARCHY themes (https://omarchy.deepakness.com/themes), fetch colors from their GitHub repos, and apply them to the app. Each OMARCHY theme links to a GitHub repo containing a color definition file (`colors.toml` for official themes, `alacritty.toml` for community themes).

## Approach

**Static theme registry** (not live scraping) — the OMARCHY website has no API, so we maintain a curated list of themes with their GitHub URLs and preview colors in a TypeScript file. When a user selects a theme, we fetch+parse the color file from GitHub via an API route, map the colors to our CSS variables, and apply them at runtime. Selection persists in localStorage.

---

## New Files

### 1. Types — `src/types/theme.ts`
- `ThemeEntry`: id, name, type (dark/light), source (official/community), author, colorFileUrl, colorFormat, preview colors
- `AppThemeColors`: all 12 CSS variable values (background, foreground, muted, accent, accent-light/dark, surface, surface-light, border, success, warning, accent-orange)

### 2. Color utilities — `src/lib/themes/color-utils.ts`
- `hexToRgb`, `rgbToHex`, `lightenColor`, `darkenColor`, `mixColors`, `isLightColor`
- Pure functions, no dependencies

### 3. Parsers — `src/lib/themes/parsers.ts`
Three parsers for the different color file formats:
- `parseColorsToml(text)` — flat `key = "#hex"` lines (official themes)
- `parseAlacrittyToml(text)` — sectioned `[colors.primary]`, `[colors.normal]`, `[colors.bright]` (community themes)
- `parseGhosttyTheme(text)` — `palette = N=#hex` lines (some community themes)

No TOML library needed — simple regex line parsing works for all formats.

### 4. Color mapper — `src/lib/themes/mapper.ts`
`mapToAppColors(raw, format) → AppThemeColors`

Mapping from OMARCHY colors to our CSS variables:
| Our variable | Official `colors.toml` | Community `alacritty.toml` |
|---|---|---|
| `--background` | `background` | `primary.background` |
| `--foreground` | `foreground` | `primary.foreground` |
| `--accent` | `accent` | `normal.blue` (fallback) |
| `--accent-light` | lighten accent 15% | lighten accent 15% |
| `--accent-dark` | darken accent 20% | darken accent 20% |
| `--muted` | `color7` | `normal.white` |
| `--surface` | `color0` | `normal.black` |
| `--surface-light` | `color8` | `bright.black` |
| `--border` | mix surface + surface-light | mix surface + surface-light |
| `--success` | `color2` (green) | `normal.green` |
| `--warning` | `color3` (yellow) | `normal.yellow` |
| `--accent-orange` | `color11` (bright yellow) | `bright.yellow` |

### 5. Theme registry — `src/lib/themes/registry.ts`
Static array of ~60 `ThemeEntry` objects. Each has:
- GitHub raw URL for its color file
- Preview colors (background + foreground + accent) embedded for instant grid rendering
- Official themes: `https://raw.githubusercontent.com/basecamp/omarchy/master/themes/{name}/colors.toml`
- Community themes: `https://raw.githubusercontent.com/{owner}/{repo}/main/alacritty.toml`

### 6. API route — `src/app/api/themes/[themeId]/colors/route.ts`
- Looks up theme in registry → fetches raw color file from GitHub
- Parses with the correct parser → maps to `AppThemeColors`
- Uses `next: { revalidate: 86400 }` for 24hr server-side caching
- No auth needed (public GitHub files), but stays behind middleware (user must be logged in)

### 7. Theme provider — `src/components/providers/theme-provider.tsx`
Client component wrapping the app in React context:
- `useLayoutEffect` on mount: reads localStorage, applies cached colors immediately (no flash)
- `applyTheme(themeId)`: fetches from API, sets CSS vars on `document.documentElement`, saves to localStorage
- `resetTheme()`: restores default Partio colors, clears localStorage
- Handles light themes by toggling `dark`/`light` class on `<html>`
- Exposes `useTheme()` hook

### 8. Theme card — `src/components/ui/theme-card.tsx`
Preview card showing: color strip (bg + fg + accent dot), theme name, author, active indicator.

### 9. Settings page — `src/app/(dashboard)/settings/page.tsx`
- "Theme" section with search input + filter tabs (All / Dark / Light)
- Grid of ThemeCards from the static registry
- "Default" card for original Partio colors
- Click to apply → calls `useTheme().applyTheme()`

### 10. Loading skeleton — `src/app/(dashboard)/settings/loading.tsx`

---

## Files to Modify

### `src/app/globals.css`
Add smooth transition for theme switching:
```css
:root { transition: background-color 0.3s ease, color 0.3s ease; }
```

### `src/app/layout.tsx`
- Wrap `SessionProvider` with `ThemeProvider`
- Remove hardcoded `className="dark"` (ThemeProvider manages this)

### `src/components/layout/sidebar.tsx`
Add Settings nav item (gear icon) below Repositories, following existing `NavItem` pattern.

---

## Implementation Order

1. **Types + color utilities** — `theme.ts`, `color-utils.ts`
2. **Parsers + mapper** — `parsers.ts`, `mapper.ts`
3. **Registry** — `registry.ts` (start with ~10 themes covering all 3 formats, expand later)
4. **API route** — `[themeId]/colors/route.ts`
5. **Theme provider** — `theme-provider.tsx`, integrate in `layout.tsx`
6. **UI** — `theme-card.tsx`, `settings/page.tsx`, `settings/loading.tsx`, sidebar update
7. **Populate full registry** — all ~60 themes with verified URLs and preview colors

## Verification

1. `npm run dev` — start the dev server
2. Navigate to `/settings` — verify theme grid renders with preview cards
3. Click a theme (e.g., Tokyo Night) — verify colors change smoothly
4. Refresh the page — verify theme persists (no flash of default)
5. Click "Default" — verify original Partio colors restore
6. Test a light theme (e.g., Catppuccin Latte) — verify light background works
7. Test search and filter tabs on settings page
8. `npm run build` — verify no build errors
