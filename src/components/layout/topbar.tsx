"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface/50 px-6 backdrop-blur-sm">
      <h1 className="text-sm font-medium text-foreground">{title}</h1>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/ArvosAI/partio/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted transition-colors hover:text-foreground"
        >
          Feedback
        </a>
        {session?.user && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="cursor-pointer"
            title="Sign out"
          >
            <Avatar
              src={session.user.image}
              alt={session.user.name || "User"}
              size={28}
            />
          </button>
        )}
      </div>
    </header>
  );
}
