"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  match?: (pathname: string) => boolean;
}

export function NavItem({ href, icon, label, match }: NavItemProps) {
  const pathname = usePathname();
  const isActive = match
    ? match(pathname)
    : href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent/10 text-accent-light"
          : "text-muted hover:bg-surface-light hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
