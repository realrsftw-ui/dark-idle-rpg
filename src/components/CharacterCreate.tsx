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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-4 text-center">
        <div className="text-lg font-bold" style={{ color: "var(--yellow)" }}>
          ASKMÖRKER
        </div>
        <p className="mt-1 text-[12px] italic" style={{ color: "var(--text-dim)" }}>
          Fördela dina grundattribut innan du kliver ner i mörkret.
        </p>
      </div>

      <div className="retro-panel">
        <div className="retro-header">SKAPA KARAKTÄR</div>
        <div className="p-3">
          <label className="label-caps mb-1 block">Namn</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="Vaelith Nattskugga"
            className="mb-3 w-full px-2 py-1.5 outline-none"
            style={{ background: "var(--bg-deep)", border: "1px solid var(--border)", color: "var(--text)" }}
          />

          <div className="retro-row flex items-center justify-between py-1.5">
            <span className="label-caps">Poäng kvar</span>
            <span style={{ color: remaining === 0 ? "var(--yellow)" : "var(--text)" }}>{remaining}</span>
          </div>

          {STAT_INFO.map((s) => (
            <div key={s.id} className="retro-row flex items-center justify-between py-1.5">
              <div>
                <div>{s.name}</div>
                <div className="text-[11px] italic" style={{ color: "var(--text-faint)" }}>
                  {s.desc}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjust(s.id, -1)}
                  disabled={stats[s.id] <= STAT_BASE}
                  className="w-5 font-bold disabled:opacity-20"
                  style={{ color: "var(--text-dim)" }}
                >
                  −
                </button>
                <span className="w-5 text-center">{stats[s.id]}</span>
                <button
                  onClick={() => adjust(s.id, 1)}
                  disabled={stats[s.id] >= STAT_MAX || remaining <= 0}
                  className="w-5 font-bold disabled:opacity-20"
                  style={{ color: "var(--yellow)" }}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="mt-3 w-full py-2 text-center font-bold disabled:opacity-30"
            style={{ background: "var(--panel-header)", border: "1px solid var(--border)", color: "var(--yellow)" }}
          >
            Kliv in i mörkret
          </button>
        </div>
      </div>
    </div>
  );
}
