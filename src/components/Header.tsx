"use client";

import { useGame } from "@/context/GameContext";
import { computeMaxHp } from "@/lib/character";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function Header() {
  const { character, resetGame } = useGame();
  if (!character) return null;
  const maxHp = computeMaxHp(character);

  return (
    <header style={{ borderBottom: "1px solid var(--panel-border)", background: "var(--bg)" }}>
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
        <div>
          <div className="font-display text-lg tracking-[0.12em]" style={{ color: "var(--gold)" }}>
            ASKMÖRKER
          </div>
        </div>

        <div className="h-8 w-px shrink-0" style={{ background: "var(--panel-border)" }} />

        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-base" style={{ color: "var(--text)" }}>
              {character.name}
            </span>
            {character.deaths > 0 && (
              <span className="label-caps" style={{ color: "var(--blood)" }}>
                {character.deaths} fall
              </span>
            )}
          </div>
          <div className="mt-1.5 max-w-xs">
            <ProgressBar
              fraction={character.hp / maxHp}
              color="linear-gradient(90deg, var(--hp), var(--hp-bright))"
              height={6}
            />
            <div className="mt-1 font-mono-num text-[11px]" style={{ color: "var(--text-muted)" }}>
              {character.hp} / {maxHp} HP
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="label-caps">Guld</div>
          <div className="font-mono-num text-lg" style={{ color: "var(--gold-bright)" }}>
            {character.gold}
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("Radera karaktär och börja om? Detta kan inte ångras.")) resetGame();
          }}
          className="label-caps hover:opacity-100"
          style={{ opacity: 0.6 }}
        >
          Nollställ
        </button>
      </div>
    </header>
  );
}
