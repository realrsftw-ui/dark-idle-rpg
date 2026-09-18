"use client";

import { useGame } from "@/context/GameContext";
import { computeMaxHp } from "@/lib/character";
import { REGIONS } from "@/data/regions";
import { ZONES } from "@/data/zones";
import { WILDERNESS_MIN_COMBAT_LEVEL, cellAt, isSafeZone } from "@/data/worldMap";
import { combatLevel } from "@/lib/engine";
import { ProgressBar } from "@/components/ui/ProgressBar";

const COMPASS: { label: string; dx: number; dy: number }[] = [
  { label: "NV", dx: -1, dy: -1 },
  { label: "N", dx: 0, dy: -1 },
  { label: "NÖ", dx: 1, dy: -1 },
  { label: "V", dx: -1, dy: 0 },
  { label: "•", dx: 0, dy: 0 },
  { label: "Ö", dx: 1, dy: 0 },
  { label: "SV", dx: -1, dy: 1 },
  { label: "S", dx: 0, dy: 1 },
  { label: "SÖ", dx: 1, dy: 1 },
];

export function Header() {
  const { character, activity, move, resetGame } = useGame();
  if (!character) return null;
  const maxHp = computeMaxHp(character);
  const pos = character.position;
  const safe = isSafeZone(pos);
  const cLevel = combatLevel(character);
  const here = cellAt(pos);
  const hereName = here.type === "zone" && here.id ? ZONES[here.id].name : safe ? REGIONS.askharad.name : REGIONS.vildmarken.name;

  return (
    <header className="retro-panel" style={{ borderLeft: "none", borderRight: "none", borderTop: "none" }}>
      <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4 px-3 py-2">
        <div className="min-w-[220px] flex-1">
          <div className="flex items-baseline justify-between">
            <span className="font-bold" style={{ color: "var(--yellow)" }}>
              ASKMÖRKER
            </span>
            <button
              onClick={() => {
                if (confirm("Radera karaktär och börja om? Detta kan inte ångras.")) resetGame();
              }}
              className="label-caps"
            >
              [Nollställ]
            </button>
          </div>
          <div className="retro-row mt-1 flex justify-between py-0.5">
            <span style={{ color: "var(--text-dim)" }}>Namn</span>
            <span>{character.name}</span>
          </div>
          <div className="retro-row flex justify-between py-0.5">
            <span style={{ color: "var(--text-dim)" }}>Guld</span>
            <span style={{ color: "var(--gold)" }}>{character.gold}</span>
          </div>
          <div className="retro-row flex justify-between py-0.5">
            <span style={{ color: "var(--text-dim)" }}>Dödsfall</span>
            <span>{character.deaths}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span style={{ color: "var(--text-dim)" }}>Aktivitet</span>
            <span>{activity ? (activity.type === "combat" ? "Strid" : "Träning") : "Ingen"}</span>
          </div>
          <div className="mt-1">
            <ProgressBar
              fraction={character.hp / maxHp}
              color="linear-gradient(90deg, var(--hp), var(--hp-bright))"
              height={8}
            />
            <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
              {character.hp} / {maxHp} HP
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <div className="mb-1 text-center text-[11px]" style={{ color: "var(--text-dim)" }}>
            Du är vid {pos.x},{pos.y} i <span style={{ color: "var(--yellow)" }}>{hereName}</span>
          </div>
          <div className="grid grid-cols-3 gap-[2px]">
            {COMPASS.map((c) => (
              <button
                key={c.label}
                onClick={() => c.dx !== 0 || c.dy !== 0 ? move(c.dx, c.dy) : undefined}
                disabled={c.dx === 0 && c.dy === 0}
                className="h-7 w-9 text-[10px] font-bold"
                style={{
                  background: "var(--panel-header)",
                  border: "1px solid var(--border)",
                  color: c.label === "•" ? "var(--text-faint)" : "var(--yellow)",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          {safe && cLevel < WILDERNESS_MIN_COMBAT_LEVEL && (
            <div className="mt-1 max-w-[140px] text-center text-[10px]" style={{ color: "var(--text-faint)" }}>
              Vildmarken kräver stridsnivå {WILDERNESS_MIN_COMBAT_LEVEL}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
