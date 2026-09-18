"use client";

import { useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { Panel } from "@/components/ui/Panel";
import { LogEntry } from "@/lib/types";

const KIND_COLOR: Record<LogEntry["kind"], string> = {
  info: "var(--text-muted)",
  damage: "var(--blood-bright)",
  loot: "var(--rarity-uncommon)",
  levelup: "var(--gold-bright)",
  death: "var(--blood)",
  gold: "var(--gold)",
};

export function ActivityLog() {
  const { log } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log.length]);

  return (
    <Panel title="Händelselogg" bare>
      <div className="flex h-56 flex-col gap-1 overflow-y-auto pr-1 font-mono-num text-xs leading-relaxed">
        {log.length === 0 && <div className="text-[var(--text-faint)]">Ingen aktivitet ännu...</div>}
        {log.map((entry) => (
          <div key={entry.id} style={{ color: KIND_COLOR[entry.kind] }}>
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </Panel>
  );
}
