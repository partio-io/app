/** Parse official OMARCHY colors.toml — flat key = "value" lines */
export function parseColorsToml(text: string): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(\w+)\s*=\s*"(#[0-9a-fA-F]{6})"/);
    if (match) {
      colors[match[1]] = match[2];
    }
  }
  return colors;
}

/** Parse Alacritty-style TOML with [colors.primary], [colors.normal], [colors.bright] sections */
export function parseAlacrittyToml(text: string): Record<string, string> {
  const colors: Record<string, string> = {};
  let currentSection = "";

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const sectionMatch = trimmed.match(/^\[colors\.(\w+)\]/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }

    const kvMatch = trimmed.match(/^(\w+)\s*=\s*["']?(#[0-9a-fA-F]{6})["']?/);
    if (kvMatch && currentSection) {
      colors[`${currentSection}.${kvMatch[1]}`] = kvMatch[2];
    }
  }
  return colors;
}

/** Parse Ghostty theme format — palette = N=#hex lines */
export function parseGhosttyTheme(text: string): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // palette = 0=#hex
    const paletteMatch = trimmed.match(
      /^palette\s*=\s*(\d+)=(#[0-9a-fA-F]{6})/
    );
    if (paletteMatch) {
      colors[`color${paletteMatch[1]}`] = paletteMatch[2];
      continue;
    }

    // background = #hex / foreground = #hex
    const kvMatch = trimmed.match(
      /^(background|foreground|cursor-color)\s*=\s*(#[0-9a-fA-F]{6})/
    );
    if (kvMatch) {
      const key = kvMatch[1] === "cursor-color" ? "cursor" : kvMatch[1];
      colors[key] = kvMatch[2];
    }
  }
  return colors;
}
