"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { NavItem } from "./nav-item";
import { Avatar } from "@/components/ui/avatar";

function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function ReposIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Sidebar() {
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image src="/partio-logo.svg" alt="partio" width={28} height={28} className="rounded-lg" />
        <span className="text-base font-semibold text-foreground">partio</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        <NavItem href="/" icon={<OverviewIcon />} label="Overview" />
        <NavItem href="/repositories" icon={<ReposIcon />} label="Repositories" />
      </nav>

      {session?.user && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar src={session.user.image} alt={session.user.name || "User"} size={28} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-muted">
                {session.user.login || session.user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
