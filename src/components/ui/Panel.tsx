import { ReactNode } from "react";

export function Panel({
  title,
  children,
  className = "",
  right,
  bare = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  right?: ReactNode;
  bare?: boolean;
}) {
  return (
    <section className={className}>
      {title && (
        <div
          className="mb-3 flex items-end justify-between pb-2"
          style={{ borderBottom: "1px solid var(--panel-border)" }}
        >
          <h2 className="section-title" style={{ color: "var(--gold)" }}>
            {title}
          </h2>
          {right}
        </div>
      )}
      {bare ? children : <div className="flex flex-col gap-3">{children}</div>}
    </section>
  );
}
