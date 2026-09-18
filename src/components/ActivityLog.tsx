"use client";

import { useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { Panel } from "@/components/ui/Panel";
import { LogEntry } from "@/lib/types";

const KIND_COLOR: Record<LogEntry["kind"], string> = {
  info: "var(--text-dim)",
  damage: "var(--red)",
  loot: "var(--green)",
  levelup: "var(--yellow)",
  death: "var(--red)",
  gold: "var(--gold)",
};

const KIND_TAG: Record<LogEntry["kind"], string> = {
  info: "Händelse",
  damage: "Strid",
  loot: "Fynd",
  levelup: "Nivå",
  death: "Död",
  gold: "Fynd",
};

export function ActivityLog() {
  const { log } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log.length]);

  return (
    <Panel title="HÄNDELSER" bare>
      <div className="flex h-56 flex-col gap-0.5 overflow-y-auto pr-1 text-[12px] leading-snug">
        {log.length === 0 && <div style={{ color: "var(--text-faint)" }}>Ingen aktivitet ännu...</div>}
        {log.map((entry) => (
          <div key={entry.id}>
            <span style={{ color: "var(--text-faint)" }}>[{KIND_TAG[entry.kind]}]</span>{" "}
            <span style={{ color: KIND_COLOR[entry.kind] }}>{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </Panel>
  );
}
