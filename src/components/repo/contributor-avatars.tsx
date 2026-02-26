import { Avatar } from "@/components/ui/avatar";
import type { Contributor } from "@/types/repository";

interface ContributorAvatarsProps {
  contributors: Contributor[];
  max?: number;
}

export function ContributorAvatars({
  contributors,
  max = 8,
}: ContributorAvatarsProps) {
  const visible = contributors.slice(0, max);
  const overflow = contributors.length - max;

  return (
    <div className="flex items-center">
      {visible.map((c) => (
        <a
          key={c.login}
          href={c.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="-ml-1.5 first:ml-0 transition-transform hover:z-10 hover:scale-110"
          title={`${c.login} (${c.contributions} contributions)`}
        >
          <Avatar src={c.avatar_url} alt={c.login} size={28} className="ring-2 ring-surface" />
        </a>
      ))}
      {overflow > 0 && (
        <span className="ml-2 text-xs text-muted">+{overflow}</span>
      )}
    </div>
  );
}
