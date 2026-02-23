"use client";

export default function RepoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-xl border border-border bg-surface p-8 text-center max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted mb-4">
          {error.message || "An unexpected error occurred while loading this repository."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
