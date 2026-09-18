"use client";

import { useGame } from "@/context/GameContext";
import { ZONES } from "@/data/zones";
import { TRAINING_SPOTS } from "@/data/trainingSpots";
import { MONSTERS } from "@/data/monsters";
import { REGIONS } from "@/data/regions";
import {
  GRID_MAX,
  GRID_MIN,
  SAFE_RADIUS,
  WILDERNESS_MIN_COMBAT_LEVEL,
  cellAt,
  chebyshevDistance,
  flavorFor,
  isSafeZone,
  SPAWN,
} from "@/data/worldMap";
import { computeMaxHp, getSkillLevel } from "@/lib/character";
import { combatLevel } from "@/lib/engine";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Position } from "@/lib/types";

const VIEW_RADIUS = 2;

export function WorldExplorer() {
  const { character, activity, startCombat, startTraining, move } = useGame();
  if (!character) return null;

  const pos = character.position;
  const cLevel = combatLevel(character);
  const here = cellAt(pos);
  const hereIsSafe = isSafeZone(pos);
  const attackLevel = getSkillLevel(character, "attack");

  const monster = activity?.currentMonsterId ? MONSTERS[activity.currentMonsterId] : null;
  const maxHp = computeMaxHp(character);
  const isDead = character.hp <= 0 && (activity?.cooldownTicks ?? 0) > 0 && activity?.type === "combat";
  const inCombat = activity?.type === "combat";

  const cells: { x: number; y: number }[][] = [];
  for (let row = -VIEW_RADIUS; row <= VIEW_RADIUS; row++) {
    const line: { x: number; y: number }[] = [];
    for (let col = -VIEW_RADIUS; col <= VIEW_RADIUS; col++) {
      line.push({ x: pos.x + col, y: pos.y + row });
    }
    cells.push(line);
  }

  function describeCell(p: Position) {
    const inBounds = p.x >= GRID_MIN && p.x <= GRID_MAX && p.y >= GRID_MIN && p.y <= GRID_MAX;
    if (!inBounds) return { inBounds: false as const };
    const cell = cellAt(p);
    const safe = isSafeZone(p);
    const locked = !safe && cLevel < WILDERNESS_MIN_COMBAT_LEVEL;
    let glyph = "·";
    let name = "";
    let color = "var(--text-faint)";
    if (cell.type === "zone" && cell.id) {
      glyph = "X";
      name = ZONES[cell.id].name;
      color = "var(--red)";
    } else if (cell.type === "training" && cell.id) {
      glyph = "+";
      name = TRAINING_SPOTS[cell.id].name;
      color = "var(--gold)";
    }
    return { inBounds: true as const, cell, safe, locked, glyph, name, color };
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel title={`KARTA — ${hereIsSafe ? REGIONS.askharad.name.toUpperCase() : REGIONS.vildmarken.name.toUpperCase()}`}>
        <div className="flex justify-center py-1">
          <div
            className="grid shrink-0 gap-[1px]"
            style={{ gridTemplateColumns: `repeat(${VIEW_RADIUS * 2 + 1}, minmax(0,1fr))`, background: "var(--border)" }}
          >
            {cells.map((line, rowIdx) =>
              line.map((p, colIdx) => {
                const info = describeCell(p);
                const isHere = p.x === pos.x && p.y === pos.y;
                const isAdjacent = Math.abs(p.x - pos.x) <= 1 && Math.abs(p.y - pos.y) <= 1 && !isHere;
                const blocked = info.inBounds && info.locked;
                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    disabled={!info.inBounds || !isAdjacent || blocked}
                    onClick={() => isAdjacent && move(p.x - pos.x, p.y - pos.y)}
                    title={info.inBounds ? info.name || (info.safe ? "" : "Vildmarken") : ""}
                    className="flex h-11 w-11 items-center justify-center text-sm font-bold sm:h-12 sm:w-12"
                    style={{
                      background: isHere ? "var(--panel-alt)" : info.inBounds ? "var(--panel)" : "var(--bg-deep)",
                      color: isHere ? "var(--yellow)" : blocked ? "var(--text-faint)" : info.color,
                      opacity: !info.inBounds ? 0.3 : isAdjacent || isHere ? 1 : 0.55,
                      cursor: isAdjacent ? "pointer" : "default",
                    }}
                  >
                    {isHere ? "@" : info.inBounds ? (blocked ? "×" : info.glyph) : ""}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="retro-row py-2 text-center text-[11px]" style={{ color: "var(--text-faint)" }}>
          @ = du · X = zon · + = träningsplats · × = låst
        </div>

        <div className="py-2">
          {here.type === "zone" && here.id ? (
            (() => {
              const zone = ZONES[here.id!];
              const locked = attackLevel < zone.requiredAttackLevel;
              return (
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold" style={{ color: "var(--red)" }}>
                      {zone.name}
                    </span>
                    <button
                      onClick={() => startCombat(zone.id)}
                      disabled={locked || inCombat}
                      className="label-caps"
                      style={{ color: locked || inCombat ? "var(--text-faint)" : "var(--yellow)" }}
                    >
                      [{inCombat ? "Pågår" : locked ? "Låst" : "Strid"}]
                    </button>
                  </div>
                  <div className="mt-1 text-[12px]" style={{ color: "var(--text-dim)" }}>
                    {zone.description}
                  </div>
                  <div className="label-caps mt-1">
                    Rek. nivå {zone.recommendedLevel} · Kräver Attack {zone.requiredAttackLevel}
                  </div>
                </div>
              );
            })()
          ) : here.type === "training" && here.id ? (
            (() => {
              const spot = TRAINING_SPOTS[here.id!];
              const level = getSkillLevel(character, spot.skillId);
              const locked = level < spot.levelRequired;
              const activeHere = activity?.type === "training" && activity.targetId === spot.id;
              return (
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold" style={{ color: "var(--gold)" }}>
                      {spot.name}
                    </span>
                    <button
                      onClick={() => startTraining(spot.id)}
                      disabled={locked || activeHere}
                      className="label-caps"
                      style={{ color: locked || activeHere ? "var(--text-faint)" : "var(--yellow)" }}
                    >
                      [{activeHere ? "Pågår" : locked ? "Låst" : "Träna"}]
                    </button>
                  </div>
                  <div className="mt-1 text-[12px]" style={{ color: "var(--text-dim)" }}>
                    {spot.description}
                  </div>
                  <div className="label-caps mt-1">
                    Kräver nivå {spot.levelRequired} · +{spot.xpPerAction} EXP/tick
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-[12px] italic" style={{ color: "var(--text-dim)" }}>
              {flavorFor(pos, pos.x * 31 + pos.y * 17)}
            </div>
          )}
        </div>

        {!hereIsSafe && (
          <div className="label-caps text-center">
            {chebyshevDistance(pos, SPAWN)} steg från Askhärad, ute i Vildmarken
          </div>
        )}
        {hereIsSafe && cLevel < WILDERNESS_MIN_COMBAT_LEVEL && (
          <div className="label-caps text-center">{SAFE_RADIUS} steg trygg mark runt torget</div>
        )}
      </Panel>

      {inCombat && (
        <Panel title={`STRID — ${(ZONES[activity.targetId]?.name ?? "").toUpperCase()}`}>
          {isDead ? (
            <div className="py-4 text-center">
              <div className="font-bold" style={{ color: "var(--red)" }}>
                Du har fallit
              </div>
              <div className="mt-1 text-[12px]" style={{ color: "var(--text-dim)" }}>
                Återhämtar dig, kliver upp snart igen.
              </div>
            </div>
          ) : monster ? (
            <div className="flex flex-col gap-3">
              <div className="retro-row pb-2">
                <div className="flex items-baseline justify-between">
                  <span>
                    {monster.name} <span style={{ color: "var(--text-faint)" }}>· nivå {monster.level}</span>
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                    {activity.monsterHp ?? monster.maxHp} / {monster.maxHp}
                  </span>
                </div>
                <ProgressBar
                  fraction={(activity.monsterHp ?? monster.maxHp) / monster.maxHp}
                  color="linear-gradient(90deg, var(--red), var(--red))"
                />
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <span>{character.name}</span>
                  <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                    {character.hp} / {maxHp}
                  </span>
                </div>
                <ProgressBar
                  fraction={character.hp / maxHp}
                  color="linear-gradient(90deg, var(--hp), var(--hp-bright))"
                />
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-[12px]" style={{ color: "var(--text-dim)" }}>
              Söker efter en fiende...
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
