"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { STAT_BASE, STAT_MAX, STAT_POINT_POOL, emptyStats } from "@/lib/character";
import { Panel } from "@/components/ui/Panel";
import { StatId } from "@/lib/types";

const STAT_INFO: { id: StatId; name: string; emoji: string; desc: string }[] = [
  { id: "str", name: "Styrka", emoji: "💪", desc: "Skada i strid" },
  { id: "dex", name: "Fingerfärdighet", emoji: "🎯", desc: "Träffchans" },
  { id: "int", name: "Intelligens", emoji: "🧠", desc: "Manapool" },
  { id: "wis", name: "Visdom", emoji: "🔮", desc: "Manapool" },
  { id: "vit", name: "Vitalitet", emoji: "❤️", desc: "Hälsopool" },
];

export function CharacterCreate() {
  const { createCharacter } = useGame();
  const [name, setName] = useState("");
  const [stats, setStats] = useState(emptyStats());

  const spent = Object.values(stats).reduce((sum, v) => sum + (v - STAT_BASE), 0);
  const remaining = STAT_POINT_POOL - spent;

  function adjust(id: StatId, delta: number) {
    setStats((prev) => {
      const next = prev[id] + delta;
      if (next < STAT_BASE || next > STAT_MAX) return prev;
      if (delta > 0 && remaining <= 0) return prev;
      return { ...prev, [id]: next };
    });
  }

  function handleSubmit() {
    if (!name.trim()) return;
    createCharacter(name, stats);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-wide text-[var(--gold)]">Skapa din vandrare</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Fördela dina grundattribut innan du kliver ner i mörkret.
        </p>
      </div>

      <Panel className="w-full" title="Karaktär" icon="🕯️">
        <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--text-muted)]">Namn</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="T.ex. Vaelith Nattskugga"
          className="mb-5 w-full rounded-md border bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--gold)]"
          style={{ borderColor: "var(--panel-border)" }}
        />

        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-[var(--text-muted)]">Poäng kvar att fördela</span>
          <span className={`font-semibold ${remaining === 0 ? "text-[var(--gold)]" : "text-[var(--text)]"}`}>
            {remaining}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {STAT_INFO.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
              style={{ borderColor: "var(--panel-border)" }}
            >
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <span>{s.emoji}</span>
                  {s.name}
                </div>
                <div className="text-xs text-[var(--text-faint)]">{s.desc}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjust(s.id, -1)}
                  disabled={stats[s.id] <= STAT_BASE}
                  className="h-7 w-7 rounded border text-[var(--text-muted)] disabled:opacity-30"
                  style={{ borderColor: "var(--panel-border)" }}
                >
                  −
                </button>
                <span className="w-6 text-center font-mono text-lg">{stats[s.id]}</span>
                <button
                  onClick={() => adjust(s.id, 1)}
                  disabled={stats[s.id] >= STAT_MAX || remaining <= 0}
                  className="h-7 w-7 rounded border text-[var(--gold)] disabled:opacity-30"
                  style={{ borderColor: "var(--panel-border)" }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="mt-6 w-full rounded-md py-2.5 font-semibold text-black transition disabled:opacity-40"
          style={{ background: "var(--gold)" }}
        >
          Kliv in i mörkret
        </button>
      </Panel>
    </div>
  );
}
