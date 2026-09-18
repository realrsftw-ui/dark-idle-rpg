"use client";

import { useGame } from "@/context/GameContext";
import { ZONES } from "@/data/zones";
import { REGIONS, REGION_ORDER } from "@/data/regions";
import { MONSTERS } from "@/data/monsters";
import { computeMaxHp, getSkillLevel } from "@/lib/character";
import { combatLevel } from "@/lib/engine";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function CombatPanel() {
  const { character, activity, startCombat } = useGame();
  if (!character) return null;

  const inThisActivity = activity?.type === "combat";
  const activeZoneId = inThisActivity ? activity.targetId : null;
  const monster = activity?.currentMonsterId ? MONSTERS[activity.currentMonsterId] : null;
  const maxHp = computeMaxHp(character);
  const isDead = character.hp <= 0 && (activity?.cooldownTicks ?? 0) > 0 && activity?.type === "combat";
  const playerCombatLevel = combatLevel(character);
  const attackLevel = getSkillLevel(character, "attack");

  return (
    <div className="flex flex-col gap-4">
      {REGION_ORDER.map((regionId) => {
        const region = REGIONS[regionId];
        const regionLocked = playerCombatLevel < region.requiredCombatLevel;
        return (
          <Panel
            key={regionId}
            title={region.name}
            icon={region.emoji}
            right={
              regionLocked ? (
                <span className="text-xs text-[var(--text-faint)]">
                  🔒 Kräver stridsnivå {region.requiredCombatLevel}
                </span>
              ) : undefined
            }
          >
            <p className="mb-3 text-xs text-[var(--text-muted)]">{region.description}</p>
            {regionLocked ? (
              <div
                className="flex flex-col items-center gap-1 rounded-md border border-dashed py-6 text-center"
                style={{ borderColor: "var(--panel-border)" }}
              >
                <div className="text-2xl opacity-40">🔒</div>
                <div className="text-sm text-[var(--text-faint)]">
                  Otillgängligt tills din stridsnivå når {region.requiredCombatLevel}.
                </div>
                <div className="text-xs text-[var(--text-faint)]">
                  (Din stridsnivå just nu: {playerCombatLevel})
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {region.zoneIds.map((zoneId) => {
                  const zone = ZONES[zoneId];
                  const locked = attackLevel < zone.requiredAttackLevel;
                  const active = activeZoneId === zoneId;
                  return (
                    <div
                      key={zoneId}
                      className="flex items-center gap-3 rounded-md border p-3"
                      style={{
                        borderColor: active ? "var(--gold)" : "var(--panel-border)",
                        background: active ? "rgba(212,175,55,0.06)" : "transparent",
                      }}
                    >
                      <div className="text-3xl">{zone.emoji}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{zone.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{zone.description}</div>
                        <div className="mt-1 text-[11px] text-[var(--text-faint)]">
                          Rek. nivå {zone.recommendedLevel} · Kräver Attack {zone.requiredAttackLevel}
                        </div>
                      </div>
                      <button
                        onClick={() => startCombat(zoneId)}
                        disabled={locked || active}
                        className="shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                        style={{
                          borderColor: "var(--blood)",
                          color: active ? "var(--text-faint)" : "var(--blood-bright)",
                        }}
                      >
                        {active ? "Pågår" : locked ? "Låst" : "Strid"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        );
      })}

      {inThisActivity && (
        <Panel title={`Strid — ${ZONES[activity.targetId]?.name ?? ""}`} icon="⚔️">
          {isDead ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="text-4xl">💀</div>
              <div className="font-medium text-[var(--blood-bright)]">Du har fallit...</div>
              <div className="text-sm text-[var(--text-muted)]">Återhämtar dig, kliver upp snart igen.</div>
            </div>
          ) : monster ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{monster.emoji}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {monster.name} <span className="text-[var(--text-faint)]">(nivå {monster.level})</span>
                    </span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {activity.monsterHp ?? monster.maxHp} / {monster.maxHp}
                    </span>
                  </div>
                  <ProgressBar
                    fraction={(activity.monsterHp ?? monster.maxHp) / monster.maxHp}
                    color="linear-gradient(90deg, var(--blood), var(--blood-bright))"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl">🧙</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">{character.name}</span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {character.hp} / {maxHp}
                    </span>
                  </div>
                  <ProgressBar
                    fraction={character.hp / maxHp}
                    color="linear-gradient(90deg, var(--hp), var(--hp-bright))"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-[var(--text-muted)]">Söker efter en fiende...</div>
          )}
        </Panel>
      )}
    </div>
  );
}
