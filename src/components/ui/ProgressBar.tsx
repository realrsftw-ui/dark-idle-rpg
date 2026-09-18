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
        <div className="mb-0.5 flex items-center justify-between text-[11px]" style={{ color: "var(--text-dim)" }}>
          <span>{label}</span>
          {showPercent && <span>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className="w-full overflow-hidden"
        style={{ height, background: "var(--bg-deep)", border: "1px solid var(--border)" }}
      >
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
