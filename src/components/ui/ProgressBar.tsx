export function ProgressBar({
  fraction,
  color,
  label,
  height = 10,
  showPercent = false,
}: {
  fraction: number;
  color: string;
  label?: string;
  height?: number;
  showPercent?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, fraction * 100));
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>{label}</span>
          {showPercent && <span>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]"
        style={{ height, border: "1px solid var(--panel-border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
