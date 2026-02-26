export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-8 w-32 rounded bg-surface-light" />
      <div className="mt-2 h-4 w-56 rounded bg-surface-light" />

      <div className="mt-8">
        <div className="h-6 w-20 rounded bg-surface-light" />
        <div className="mt-4 flex gap-3">
          <div className="h-10 w-72 rounded-lg bg-surface-light" />
          <div className="h-10 w-40 rounded-lg bg-surface-light" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-surface-light" />
          ))}
        </div>
      </div>
    </div>
  );
}
