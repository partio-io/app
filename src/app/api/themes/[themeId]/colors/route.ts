import { NextResponse } from "next/server";
import { getThemeById } from "@/lib/themes/registry";
import {
  parseColorsToml,
  parseAlacrittyToml,
  parseGhosttyTheme,
} from "@/lib/themes/parsers";
import { mapToAppColors } from "@/lib/themes/mapper";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ themeId: string }> }
) {
  const { themeId } = await params;
  const theme = getThemeById(themeId);

  if (!theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  try {
    const res = await fetch(theme.colorFileUrl, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch theme colors" },
        { status: 502 }
      );
    }

    const text = await res.text();

    let raw: Record<string, string>;
    switch (theme.colorFormat) {
      case "alacritty-toml":
        raw = parseAlacrittyToml(text);
        break;
      case "ghostty":
        raw = parseGhosttyTheme(text);
        break;
      default:
        raw = parseColorsToml(text);
    }

    const colors = mapToAppColors(raw, theme.colorFormat);
    return NextResponse.json(colors);
  } catch {
    return NextResponse.json(
      { error: "Internal error processing theme" },
      { status: 500 }
    );
  }
}
