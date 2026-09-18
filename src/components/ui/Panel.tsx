import { ReactNode } from "react";

export function Panel({
  title,
  icon,
  children,
  className = "",
  right,
}: {
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border bg-[var(--panel)] shadow-[0_0_0_1px_rgba(0,0,0,0.3)] ${className}`}
      style={{ borderColor: "var(--panel-border)" }}
    >
      {title && (
        <div
          className="flex items-center justify-between border-b px-4 py-2.5"
          style={{ borderColor: "var(--panel-border)" }}
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--gold)]">
            {icon && <span>{icon}</span>}
            {title}
          </h2>
          {right}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
