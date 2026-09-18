"use client";

import { useGame } from "@/context/GameContext";
import { TRAINING_SPOTS, TRAINING_SPOT_ORDER } from "@/data/trainingSpots";
import { SKILLS } from "@/data/skills";
import { getSkillLevel } from "@/lib/character";
import { Panel } from "@/components/ui/Panel";

export function TrainingPanel() {
  const { character, activity, startTraining } = useGame();
  if (!character) return null;

  const activeSpotId = activity?.type === "training" ? activity.targetId : null;

  return (
    <Panel title="Träningsplatser" icon="⛏️">
      <div className="flex flex-col gap-3">
        {TRAINING_SPOT_ORDER.map((spotId) => {
          const spot = TRAINING_SPOTS[spotId];
          const skill = SKILLS[spot.skillId];
          const level = getSkillLevel(character, spot.skillId);
          const locked = level < spot.levelRequired;
          const active = activeSpotId === spotId;
          return (
            <div
              key={spotId}
              className="flex items-center gap-3 rounded-md border p-3"
              style={{
                borderColor: active ? "var(--gold)" : "var(--panel-border)",
                background: active ? "rgba(212,175,55,0.06)" : "transparent",
              }}
            >
              <div className="text-3xl">{spot.emoji}</div>
              <div className="flex-1">
                <div className="font-semibold">{spot.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{spot.description}</div>
                <div className="mt-1 text-[11px] text-[var(--text-faint)]">
                  {skill.emoji} {skill.name} · Kräver nivå {spot.levelRequired} · +{spot.xpPerAction} EXP/tick
                </div>
              </div>
              <button
                onClick={() => startTraining(spotId)}
                disabled={locked || active}
                className="shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                style={{
                  borderColor: "var(--gold)",
                  color: active ? "var(--text-faint)" : "var(--gold-bright)",
                }}
              >
                {active ? "Pågår" : locked ? "Låst" : "Träna"}
              </button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
