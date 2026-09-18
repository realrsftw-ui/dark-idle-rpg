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
    <div className={className}>
      {title && (
        <div className="retro-header flex items-center justify-between">
          <span>{title}</span>
          {right}
        </div>
      )}
      <div className="retro-panel p-2">{bare ? children : <div className="flex flex-col">{children}</div>}</div>
    </div>
  );
}
