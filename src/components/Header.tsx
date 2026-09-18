"use client";

import { useGame } from "@/context/GameContext";
import { computeMaxHp } from "@/lib/character";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function Header() {
  const { character, resetGame } = useGame();
  if (!character) return null;
  const maxHp = computeMaxHp(character);

  return (
    <header
      className="sticky top-0 z-20 border-b backdrop-blur"
      style={{ borderColor: "var(--panel-border)", background: "rgba(10,9,16,0.9)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <div className="text-xl">🕯️</div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[var(--gold)]">{character.name}</span>
            <span className="text-xs text-[var(--text-faint)]">
              {character.deaths} dödsfall
            </span>
          </div>
          <div className="mt-1 max-w-xs">
            <ProgressBar
              fraction={character.hp / maxHp}
              color="linear-gradient(90deg, var(--hp), var(--hp-bright))"
              height={8}
            />
            <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              {character.hp} / {maxHp} HP
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm" style={{ borderColor: "var(--panel-border)" }}>
          <span>🪙</span>
          <span className="font-mono font-semibold text-[var(--gold)]">{character.gold}</span>
        </div>
        <button
          onClick={() => {
            if (confirm("Radera karaktär och börja om? Detta kan inte ångras.")) resetGame();
          }}
          className="text-xs text-[var(--text-faint)] hover:text-[var(--blood-bright)]"
        >
          Nollställ
        </button>
      </div>
    </header>
  );
}
