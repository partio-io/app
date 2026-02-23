import type { Label } from "@/types/repository";

interface LabelBadgeProps {
  label: Label;
}

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export function LabelBadge({ label }: LabelBadgeProps) {
  const bgColor = `#${label.color}`;
  const textColor = getContrastColor(label.color);

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {label.name}
    </span>
  );
}
