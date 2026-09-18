"use client";

import { useGame } from "@/context/GameContext";
import { SKILLS, SKILL_ORDER } from "@/data/skills";
import { skillProgress } from "@/lib/character";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MAX_LEVEL } from "@/lib/expCurve";

const SKILL_COLOR: Record<string, string> = {
  attack: "var(--skill-attack)",
  strength: "var(--skill-strength)",
  defense: "var(--skill-defense)",
  mining: "var(--skill-mining)",
  woodcutting: "var(--skill-woodcutting)",
};

export function SkillsPanel() {
  const { character } = useGame();
  if (!character) return null;

  return (
    <Panel title="Färdigheter" icon="📖">
      <div className="flex flex-col gap-3">
        {SKILL_ORDER.map((id) => {
          const def = SKILLS[id];
          const progress = skillProgress(character, id);
          const maxed = progress.level >= MAX_LEVEL;
          return (
            <div key={id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span>{def.emoji}</span>
                  {def.name}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  Nivå {progress.level}
                  {maxed ? " (max)" : ` · ${progress.xp.toLocaleString("sv-SE")} EXP`}
                </span>
              </div>
              <ProgressBar fraction={maxed ? 1 : progress.fraction} color={SKILL_COLOR[id]} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
