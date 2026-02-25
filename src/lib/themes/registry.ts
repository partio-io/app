import type { ThemeEntry } from "@/types/theme";

const OMARCHY_BASE =
  "https://raw.githubusercontent.com/basecamp/omarchy/dev/themes";

function official(
  id: string,
  name: string,
  type: "dark" | "light",
  preview: ThemeEntry["preview"],
  bgFiles: string[] = []
): ThemeEntry {
  return {
    id,
    name,
    type,
    source: "official",
    author: "Omarchy",
    colorFileUrl: `${OMARCHY_BASE}/${id}/colors.toml`,
    colorFormat: "colors-toml",
    previewImageUrl: `${OMARCHY_BASE}/${id}/preview.png`,
    backgroundImages: bgFiles.map(
      (f) => `${OMARCHY_BASE}/${id}/backgrounds/${f}`
    ),
    preview,
  };
}

// Map of community repos that have a preview image and what it's called
const COMMUNITY_IMAGES: Record<string, string> = {
  "catlee/omarchy-dracula-theme": "theme.png",
  "bjarneo/omarchy-futurism-theme": "preview.png",
  "bjarneo/omarchy-nes-theme": "theme.png",
  "bjarneo/omarchy-ash-theme": "theme.png",
  "bjarneo/omarchy-pulsar-theme": "theme.png",
  "bjarneo/omarchy-aura-theme": "theme.png",
  "bjarneo/omarchy-snow-theme": "preview.png",
  "euandeas/omarchy-flexoki-dark-theme": "preview.png",
  "Hydradevx/omarchy-azure-glow-theme": "preview.png",
  "hoblin/omarchy-cobalt2-theme": "preview.png",
};

// Map of community repos that have background images
const COMMUNITY_BACKGROUNDS: Record<string, string[]> = {
  "catlee/omarchy-dracula-theme": [
    "base.png",
    "dracula-leaves-6272a4-dark.png",
    "dracula-mnt-282a36.png",
  ],
  "bjarneo/omarchy-futurism-theme": [
    "1-futurism.jpg",
    "2-futurism.png",
    "3-futurism.png",
    "4-futurism.jpg",
  ],
  "bjarneo/omarchy-aura-theme": ["1.png", "2.png"],
  "bjarneo/omarchy-pulsar-theme": ["1.jpg", "2.png", "3.png", "4.jpg", "5.jpg"],
  "omacom-io/omarchy-synthwave84-theme": ["1-synthwave-84.jpg"],
  "sc0ttman/omarchy-one-dark-pro-theme": [
    "bg1.png",
    "bg2.png",
    "bg3.png",
    "bg4.png",
    "bg5.png",
    "bg6.png",
    "bg7.jpg",
    "bg8.jpg",
  ],
};

function community(
  id: string,
  name: string,
  type: "dark" | "light",
  author: string,
  repo: string,
  branch: string,
  preview: ThemeEntry["preview"],
  format: ThemeEntry["colorFormat"] = "alacritty-toml"
): ThemeEntry {
  const file = format === "colors-toml" ? "colors.toml" : "alacritty.toml";
  const imageFile = COMMUNITY_IMAGES[repo];
  const bgFiles = COMMUNITY_BACKGROUNDS[repo];
  return {
    id,
    name,
    type,
    source: "community",
    author,
    colorFileUrl: `https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
    colorFormat: format,
    previewImageUrl: imageFile
      ? `https://raw.githubusercontent.com/${repo}/${branch}/${imageFile}`
      : undefined,
    backgroundImages: bgFiles?.map(
      (f) => `https://raw.githubusercontent.com/${repo}/${branch}/backgrounds/${f}`
    ),
    preview,
  };
}

export const themeRegistry: ThemeEntry[] = [
  // ── Official Themes (Dark) ──────────────────────────────────────────
  official(
    "tokyo-night", "Tokyo Night", "dark",
    { background: "#1a1b26", foreground: "#a9b1d6", accent: "#7aa2f7" },
    ["0-swirl-buck.jpg", "1-sunset-lake.png", "2-pawel-czerwinski.jpg", "3-milad-fakurian.jpg"]
  ),
  official(
    "catppuccin", "Catppuccin Mocha", "dark",
    { background: "#1e1e2e", foreground: "#cdd6f4", accent: "#89b4fa" },
    ["1-totoro.png", "2-waves.png", "3-blue-eye.png"]
  ),
  official(
    "gruvbox", "Gruvbox", "dark",
    { background: "#282828", foreground: "#d4be98", accent: "#7daea3" },
    ["1-the-backwater.jpg", "2-leaves.jpg"]
  ),
  official(
    "nord", "Nord", "dark",
    { background: "#2e3440", foreground: "#d8dee9", accent: "#81a1c1" },
    ["0-black-moon.jpg", "1-city-view.png", "2-night-hawks.png"]
  ),
  official(
    "ethereal", "Ethereal", "dark",
    { background: "#060B1E", foreground: "#ffcead", accent: "#7d82d9" },
    ["1-cosmic.jpg", "2-meadow.jpg"]
  ),
  official(
    "everforest", "Everforest", "dark",
    { background: "#2d353b", foreground: "#d3c6aa", accent: "#7fbbb3" },
    ["1-tree-tops.jpg"]
  ),
  official(
    "hackerman", "Hackerman", "dark",
    { background: "#0B0C16", foreground: "#ddf7ff", accent: "#82FB9C" },
    ["1-synth-scape.jpg", "2-geometric.jpg"]
  ),
  official(
    "kanagawa", "Kanagawa", "dark",
    { background: "#1f1f28", foreground: "#dcd7ba", accent: "#7e9cd8" },
    ["1-kanagawa.jpg"]
  ),
  official(
    "matte-black", "Matte Black", "dark",
    { background: "#121212", foreground: "#bebebe", accent: "#e68e0d" },
    ["0-ship-at-sea.jpg", "1-dark-waters.jpg", "2-dot-hands.jpg"]
  ),
  official(
    "miasma", "Miasma", "dark",
    { background: "#222222", foreground: "#c2c2b0", accent: "#78824b" },
    ["01-nature-of-fear.jpg", "02-crowned.jpg"]
  ),
  official(
    "osaka-jade", "Osaka Jade", "dark",
    { background: "#111c18", foreground: "#C1C497", accent: "#509475" },
    ["1-glowing-city.jpg", "2-shaded-entrance.jpg", "3-mountain-moon.jpg"]
  ),
  official(
    "ristretto", "Ristretto", "dark",
    { background: "#2c2525", foreground: "#e6d9db", accent: "#f38d70" },
    ["1-color-curves.jpg", "2-coffee-beans.jpg", "3-industrial-moon.jpg"]
  ),
  official(
    "vantablack", "Vantablack", "dark",
    { background: "#0d0d0d", foreground: "#ffffff", accent: "#8d8d8d" },
    ["1-twisted-stairs.jpg", "2-layers-deep.jpg", "3-layers-stacked.jpg"]
  ),

  // ── Official Themes (Light) ─────────────────────────────────────────
  official(
    "catppuccin-latte", "Catppuccin Latte", "light",
    { background: "#eff1f5", foreground: "#4c4f69", accent: "#1e66f5" },
    ["1-color-fade.png"]
  ),
  official(
    "rose-pine", "Rose Pine Dawn", "light",
    { background: "#faf4ed", foreground: "#575279", accent: "#56949f" },
    ["1-funky-shapes.jpg", "2-dot-map.png", "3-omarchy-plants.png"]
  ),
  official(
    "flexoki-light", "Flexoki Light", "light",
    { background: "#FFFCF0", foreground: "#100F0F", accent: "#205EA6" },
    ["1-orb.png", "2-omarchy.png"]
  ),
  official(
    "white", "White", "light",
    { background: "#ffffff", foreground: "#000000", accent: "#6e6e6e" },
    ["1-white.jpg", "2-white.jpg", "3-white.jpg"]
  ),

  // ── Community Themes (Dark) ─────────────────────────────────────────
  community(
    "dracula",
    "Dracula",
    "dark",
    "catlee",
    "catlee/omarchy-dracula-theme",
    "main",
    { background: "#282a36", foreground: "#f8f8f2", accent: "#bd93f9" }
  ),
  community(
    "solarized",
    "Solarized Dark",
    "dark",
    "Gazler",
    "Gazler/omarchy-solarized-theme",
    "master",
    { background: "#002b36", foreground: "#839496", accent: "#268bd2" }
  ),
  community(
    "one-dark-pro",
    "One Dark Pro",
    "dark",
    "sc0ttman",
    "sc0ttman/omarchy-one-dark-pro-theme",
    "main",
    { background: "#1e2229", foreground: "#abb2bf", accent: "#61afef" }
  ),
  community(
    "synthwave84",
    "Synthwave '84",
    "dark",
    "omacom-io",
    "omacom-io/omarchy-synthwave84-theme",
    "master",
    { background: "#240037", foreground: "#ffffff", accent: "#0080ff" }
  ),
  community(
    "aura",
    "Aura",
    "dark",
    "bjarneo",
    "bjarneo/omarchy-aura-theme",
    "main",
    { background: "#282A36", foreground: "#F8F8F2", accent: "#8BE9FD" }
  ),
  community(
    "futurism",
    "Futurism",
    "dark",
    "bjarneo",
    "bjarneo/omarchy-futurism-theme",
    "main",
    { background: "#0A1428", foreground: "#F0F8FF", accent: "#FF40A3" },
    "colors-toml"
  ),
  community(
    "nes",
    "NES",
    "dark",
    "bjarneo",
    "bjarneo/omarchy-nes-theme",
    "main",
    { background: "#101010", foreground: "#CECFC9", accent: "#D93F37" }
  ),
  community(
    "ash",
    "Ash",
    "dark",
    "bjarneo",
    "bjarneo/omarchy-ash-theme",
    "main",
    { background: "#121212", foreground: "#e0e0e0", accent: "#626262" }
  ),
  community(
    "pulsar",
    "Pulsar",
    "dark",
    "bjarneo",
    "bjarneo/omarchy-pulsar-theme",
    "main",
    { background: "#0a0a0f", foreground: "#e0e0e8", accent: "#7c4dff" }
  ),
  community(
    "flexoki-dark",
    "Flexoki Dark",
    "dark",
    "euandeas",
    "euandeas/omarchy-flexoki-dark-theme",
    "main",
    { background: "#100F0F", foreground: "#CECDC3", accent: "#205EA6" }
  ),
  community(
    "rose-pine-dark",
    "Rose Pine Dark",
    "dark",
    "guilhermetk",
    "guilhermetk/omarchy-rose-pine-dark",
    "main",
    { background: "#191724", foreground: "#e0def4", accent: "#c4a7e7" }
  ),
  community(
    "all-hallows-eve",
    "All Hallow's Eve",
    "dark",
    "guilhermetk",
    "guilhermetk/omarchy-all-hallows-eve-theme",
    "main",
    { background: "#1a1a2e", foreground: "#e0d8c0", accent: "#ff6600" }
  ),
  community(
    "azure-glow",
    "Azure Glow",
    "dark",
    "Hydradevx",
    "Hydradevx/omarchy-azure-glow-theme",
    "main",
    { background: "#0a0e1a", foreground: "#c8d6e5", accent: "#00a8ff" }
  ),
  community(
    "blue-ridge-dark",
    "Blue Ridge Dark",
    "dark",
    "hipsterusername",
    "hipsterusername/omarchy-blueridge-dark-theme",
    "main",
    { background: "#1a1b2e", foreground: "#d4d6e4", accent: "#5b8cff" }
  ),
  community(
    "green-garden",
    "Green Garden",
    "dark",
    "kalk-ak",
    "kalk-ak/omarchy-green-garden-theme",
    "main",
    { background: "#1a2e1a", foreground: "#c8e0c8", accent: "#4caf50" }
  ),
  community(
    "gold-rush",
    "Gold Rush",
    "dark",
    "tahayvr",
    "tahayvr/omarchy-gold-rush-theme",
    "main",
    { background: "#1a1612", foreground: "#e8d5b5", accent: "#ffd700" }
  ),
  community(
    "mars",
    "Mars",
    "dark",
    "steve-lohmeyer",
    "steve-lohmeyer/omarchy-mars-theme",
    "main",
    { background: "#1a0a0a", foreground: "#e0c8c8", accent: "#ff4444" }
  ),
  community(
    "midnight",
    "Midnight",
    "dark",
    "JaxonWright",
    "JaxonWright/omarchy-midnight-theme",
    "main",
    { background: "#0d1117", foreground: "#c9d1d9", accent: "#58a6ff" }
  ),
  community(
    "monochrome",
    "Monochrome",
    "dark",
    "Swarnim114",
    "Swarnim114/omarchy-monochrome-theme",
    "main",
    { background: "#1a1a1a", foreground: "#d4d4d4", accent: "#808080" }
  ),
  community(
    "space-monkey",
    "Space Monkey",
    "dark",
    "TyRichards",
    "TyRichards/omarchy-space-monkey-theme",
    "main",
    { background: "#1a1a2e", foreground: "#e0e0e0", accent: "#00ff88" }
  ),
  community(
    "solarized-osaka",
    "Solarized Osaka",
    "dark",
    "motorsss",
    "motorsss/omarchy-solarizedosaka-theme",
    "main",
    { background: "#0d1117", foreground: "#839496", accent: "#268bd2" }
  ),
  community(
    "waveform-dark",
    "Waveform Dark",
    "dark",
    "hipsterusername",
    "hipsterusername/omarchy-waveform-dark-theme",
    "main",
    { background: "#1a1a2e", foreground: "#d4d4e4", accent: "#ff6b9d" }
  ),
  community(
    "vague",
    "Vague",
    "dark",
    "Rnedlose",
    "Rnedlose/omarchy-vague-theme",
    "main",
    { background: "#18191a", foreground: "#cdcdcd", accent: "#7a88cf" }
  ),
  community(
    "void",
    "Void",
    "dark",
    "vyrx-dev",
    "vyrx-dev/omarchy-void-theme",
    "main",
    { background: "#0a0a0a", foreground: "#d0d0d0", accent: "#8b5cf6" }
  ),
  community(
    "c64",
    "C64",
    "dark",
    "scar45",
    "scar45/omarchy-c64-theme",
    "main",
    { background: "#40318d", foreground: "#7869c4", accent: "#6c5eb5" }
  ),
  community(
    "cobalt2",
    "Cobalt2",
    "dark",
    "hoblin",
    "hoblin/omarchy-cobalt2-theme",
    "main",
    { background: "#193549", foreground: "#ffffff", accent: "#ffc600" }
  ),
  community(
    "akane",
    "Akane",
    "dark",
    "Grenish",
    "Grenish/omarchy-akane-theme",
    "main",
    { background: "#1a1a2e", foreground: "#e0c8c8", accent: "#e84057" }
  ),
  community(
    "sunset-drive",
    "Sunset Drive",
    "dark",
    "tahayvr",
    "tahayvr/omarchy-sunset-drive-theme",
    "main",
    { background: "#1a1020", foreground: "#e8d0e0", accent: "#ff6b6b" }
  ),
  community(
    "krishna",
    "Krishna",
    "dark",
    "tanishenigma",
    "tanishenigma/omarchy-krishna-theme",
    "main",
    { background: "#0d1117", foreground: "#c9d1d9", accent: "#ffd700" }
  ),
  community(
    "felix",
    "Felix",
    "dark",
    "TyRichards",
    "TyRichards/omarchy-felix-theme",
    "main",
    { background: "#1e1e2e", foreground: "#d4d4d4", accent: "#f5a623" }
  ),
  community(
    "super-game-bro",
    "Super Game Bro",
    "dark",
    "TyRichards",
    "TyRichards/omarchy-super-game-bro-theme",
    "main",
    { background: "#0f380f", foreground: "#9bbc0f", accent: "#8bac0f" }
  ),
  community(
    "retropc",
    "RetroPC",
    "dark",
    "rondilley",
    "rondilley/omarchy-retropc-theme",
    "main",
    { background: "#1a1a1a", foreground: "#33ff33", accent: "#33ff33" }
  ),

  // ── Community Themes (Light) ────────────────────────────────────────
  community(
    "milky-matcha",
    "Milky Matcha",
    "light",
    "hipsterusername",
    "hipsterusername/omarchy-milkmatcha-light-theme",
    "main",
    { background: "#f4f1e8", foreground: "#5c6a53", accent: "#7a9461" }
  ),
  community(
    "snow",
    "Snow",
    "light",
    "bjarneo",
    "bjarneo/omarchy-snow-theme",
    "main",
    { background: "#ffffff", foreground: "#0a0a0a", accent: "#0a0a0a" }
  ),
  community(
    "solarized-light",
    "Solarized Light",
    "light",
    "dfrico",
    "dfrico/omarchy-solarized-light-theme",
    "main",
    { background: "#fdf6e3", foreground: "#657b83", accent: "#268bd2" }
  ),
  community(
    "white-gold",
    "White Gold",
    "light",
    "HANCORE-linux",
    "HANCORE-linux/omarchy-whitegold-theme",
    "main",
    { background: "#fefefe", foreground: "#2e2e2e", accent: "#d4a574" }
  ),
];

export function getThemeById(id: string): ThemeEntry | undefined {
  return themeRegistry.find((t) => t.id === id);
}
