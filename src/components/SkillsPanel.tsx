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
    <Panel title="FÄRDIGHETER">
      {SKILL_ORDER.map((id) => {
        const def = SKILLS[id];
        const progress = skillProgress(character, id);
        const maxed = progress.level >= MAX_LEVEL;
        return (
          <div key={id} className="retro-row py-1.5">
            <div className="flex items-baseline justify-between">
              <span style={{ color: "var(--text)" }}>{def.name}</span>
              <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                Nivå {progress.level}
                {maxed ? "" : ` (${progress.xp.toLocaleString("sv-SE")} exp)`}
              </span>
            </div>
            <ProgressBar fraction={maxed ? 1 : progress.fraction} color={SKILL_COLOR[id]} height={4} />
          </div>
        );
      })}
    </Panel>
  );
}
