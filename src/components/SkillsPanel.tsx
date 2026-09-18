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
    <Panel title="Färdigheter">
      <div className="flex flex-col gap-3">
        {SKILL_ORDER.map((id) => {
          const def = SKILLS[id];
          const progress = skillProgress(character, id);
          const maxed = progress.level >= MAX_LEVEL;
          return (
            <div key={id} className="flex gap-2.5">
              <div className="w-[3px] shrink-0 rounded-none" style={{ background: SKILL_COLOR[id] }} />
              <div className="flex-1">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {def.name}
                  </span>
                  <span className="font-mono-num text-xs" style={{ color: "var(--text-muted)" }}>
                    {progress.level}
                    {maxed ? "" : ` · ${progress.xp.toLocaleString("sv-SE")}`}
                  </span>
                </div>
                <ProgressBar fraction={maxed ? 1 : progress.fraction} color={SKILL_COLOR[id]} height={5} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
