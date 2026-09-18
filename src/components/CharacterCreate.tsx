"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { STAT_BASE, STAT_MAX, STAT_POINT_POOL, emptyStats } from "@/lib/character";
import { StatId } from "@/lib/types";

const STAT_INFO: { id: StatId; name: string; desc: string }[] = [
  { id: "str", name: "Styrka", desc: "Skada i strid" },
  { id: "dex", name: "Fingerfärdighet", desc: "Träffchans" },
  { id: "int", name: "Intelligens", desc: "Manapool" },
  { id: "wis", name: "Visdom", desc: "Manapool" },
  { id: "vit", name: "Vitalitet", desc: "Hälsopool" },
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
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="font-display text-2xl tracking-[0.14em]" style={{ color: "var(--gold)" }}>
          ASKMÖRKER
        </div>
        <p className="mt-3 text-sm italic" style={{ color: "var(--text-muted)" }}>
          Fördela dina grundattribut innan du kliver ner i mörkret.
        </p>
      </div>

      <div className="rule mb-6" />

      <label className="label-caps mb-2 block">Namn</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        placeholder="Vaelith Nattskugga"
        className="mb-7 w-full border-b bg-transparent pb-2 text-lg outline-none"
        style={{ borderColor: "var(--panel-border)", color: "var(--text)", fontFamily: "var(--font-body)" }}
      />

      <div className="mb-3 flex items-center justify-between">
        <span className="label-caps">Poäng kvar</span>
        <span className="font-mono-num text-sm" style={{ color: remaining === 0 ? "var(--gold)" : "var(--text)" }}>
          {remaining}
        </span>
      </div>

      <div className="flex flex-col">
        {STAT_INFO.map((s, i) => (
          <div key={s.id}>
            {i > 0 && <div className="rule-full" />}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm" style={{ color: "var(--text)" }}>
                  {s.name}
                </div>
                <div className="text-xs italic" style={{ color: "var(--text-faint)" }}>
                  {s.desc}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => adjust(s.id, -1)}
                  disabled={stats[s.id] <= STAT_BASE}
                  className="font-display text-lg disabled:opacity-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  −
                </button>
                <span className="font-mono-num w-6 text-center text-lg">{stats[s.id]}</span>
                <button
                  onClick={() => adjust(s.id, 1)}
                  disabled={stats[s.id] >= STAT_MAX || remaining <= 0}
                  className="font-display text-lg disabled:opacity-20"
                  style={{ color: "var(--gold)" }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rule my-7" />

      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="section-title w-full border py-3 text-center transition disabled:opacity-30"
        style={{ borderColor: "var(--gold)", color: "var(--gold-bright)" }}
      >
        Kliv in i mörkret
      </button>
    </div>
  );
}
