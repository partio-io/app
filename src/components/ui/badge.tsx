import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "danger" | "purple" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "border-accent/30 bg-accent/10 text-accent-light",
  success:
    "border-success/30 bg-success/10 text-success",
  danger:
    "border-red-500/30 bg-red-500/10 text-red-400",
  purple:
    "border-purple-pr/30 bg-purple-pr/10 text-purple-pr",
  muted:
    "border-muted/30 bg-muted/10 text-muted",
};

export function Badge({
  children,
  className,
  variant = "default",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
