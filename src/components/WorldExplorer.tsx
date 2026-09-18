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
      glyph = "▲";
      name = ZONES[cell.id].name;
      color = "var(--blood-bright)";
    } else if (cell.type === "training" && cell.id) {
      glyph = "◇";
      name = TRAINING_SPOTS[cell.id].name;
      color = "var(--gold)";
    }
    return { inBounds: true as const, cell, safe, locked, glyph, name, color };
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Karta"
        right={
          <span className="font-mono-num text-xs" style={{ color: "var(--text-faint)" }}>
            {hereIsSafe ? REGIONS.askharad.name : REGIONS.vildmarken.name} · {pos.x},{pos.y}
          </span>
        }
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
          <div
            className="grid shrink-0 gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${VIEW_RADIUS * 2 + 1}, minmax(0,1fr))` }}
          >
            {cells.map((line, rowIdx) =>
              line.map((p, colIdx) => {
                const info = describeCell(p);
                const isHere = p.x === pos.x && p.y === pos.y;
                const isAdjacent =
                  (Math.abs(p.x - pos.x) === 1 && p.y === pos.y) ||
                  (Math.abs(p.y - pos.y) === 1 && p.x === pos.x);
                const blocked = info.inBounds && info.locked;
                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    disabled={!info.inBounds || !isAdjacent || blocked}
                    onClick={() => isAdjacent && move(p.x - pos.x, p.y - pos.y)}
                    title={info.inBounds ? info.name || (info.safe ? "" : "Vildmarken") : ""}
                    className="font-mono-num flex h-11 w-11 items-center justify-center text-base transition sm:h-12 sm:w-12"
                    style={{
                      border: isHere
                        ? "1px solid var(--gold)"
                        : info.inBounds
                          ? "1px solid var(--panel-border)"
                          : "1px solid transparent",
                      color: isHere ? "var(--gold-bright)" : blocked ? "var(--text-faint)" : info.color,
                      opacity: !info.inBounds ? 0 : isAdjacent || isHere ? 1 : 0.45,
                      cursor: isAdjacent ? "pointer" : "default",
                      background: isHere ? "rgba(212,175,55,0.08)" : "transparent",
                    }}
                  >
                    {isHere ? "◆" : info.inBounds ? (blocked ? "×" : info.glyph) : ""}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <button onClick={() => move(0, -1)} className="h-9 w-9 border text-sm" style={navBtnStyle}>
              ▲
            </button>
            <div className="flex gap-1">
              <button onClick={() => move(-1, 0)} className="h-9 w-9 border text-sm" style={navBtnStyle}>
                ◀
              </button>
              <button onClick={() => move(0, 1)} className="h-9 w-9 border text-sm" style={navBtnStyle}>
                ▼
              </button>
              <button onClick={() => move(1, 0)} className="h-9 w-9 border text-sm" style={navBtnStyle}>
                ▶
              </button>
            </div>
            <div className="label-caps mt-2 text-center leading-tight">
              N · V<br />S · Ö
            </div>
          </div>
        </div>

        <div className="rule my-4" />

        {here.type === "zone" && here.id ? (
          (() => {
            const zone = ZONES[here.id!];
            const locked = attackLevel < zone.requiredAttackLevel;
            return (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-base" style={{ color: "var(--blood-bright)" }}>
                    {zone.name}
                  </div>
                  <div className="mt-1 max-w-md text-sm italic" style={{ color: "var(--text-muted)" }}>
                    {zone.description}
                  </div>
                  <div className="label-caps mt-2">
                    Rek. nivå {zone.recommendedLevel} · Kräver Attack {zone.requiredAttackLevel}
                  </div>
                </div>
                <button
                  onClick={() => startCombat(zone.id)}
                  disabled={locked || inCombat}
                  className="label-caps shrink-0 border px-4 py-2 disabled:opacity-30"
                  style={{ borderColor: "var(--blood)", color: "var(--blood-bright)" }}
                >
                  {inCombat ? "Pågår" : locked ? "Låst" : "Strid"}
                </button>
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-base" style={{ color: "var(--gold-bright)" }}>
                    {spot.name}
                  </div>
                  <div className="mt-1 max-w-md text-sm italic" style={{ color: "var(--text-muted)" }}>
                    {spot.description}
                  </div>
                  <div className="label-caps mt-2">
                    Kräver nivå {spot.levelRequired} · +{spot.xpPerAction} EXP/tick
                  </div>
                </div>
                <button
                  onClick={() => startTraining(spot.id)}
                  disabled={locked || activeHere}
                  className="label-caps shrink-0 border px-4 py-2 disabled:opacity-30"
                  style={{ borderColor: "var(--gold)", color: "var(--gold-bright)" }}
                >
                  {activeHere ? "Pågår" : locked ? "Låst" : "Träna"}
                </button>
              </div>
            );
          })()
        ) : (
          <div className="text-sm italic" style={{ color: "var(--text-muted)" }}>
            {flavorFor(pos, pos.x * 31 + pos.y * 17)}
          </div>
        )}

        {!hereIsSafe && (
          <div className="label-caps mt-4 text-center">
            {chebyshevDistance(pos, SPAWN)} steg från Askhärad, ute i Vildmarken
          </div>
        )}
        {hereIsSafe && cLevel < WILDERNESS_MIN_COMBAT_LEVEL && (
          <div className="label-caps mt-4 text-center">
            Vildmarken öppnar vid stridsnivå {WILDERNESS_MIN_COMBAT_LEVEL} (nu {cLevel}) — {SAFE_RADIUS} steg
            trygg mark
          </div>
        )}
      </Panel>

      {inCombat && (
        <Panel title={`Strid — ${ZONES[activity.targetId]?.name ?? ""}`}>
          {isDead ? (
            <div className="py-6 text-center">
              <div className="font-display text-lg" style={{ color: "var(--blood-bright)" }}>
                Du har fallit
              </div>
              <div className="mt-1 text-sm italic" style={{ color: "var(--text-muted)" }}>
                Återhämtar dig, kliver upp snart igen.
              </div>
            </div>
          ) : monster ? (
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {monster.name} <span style={{ color: "var(--text-faint)" }}>· nivå {monster.level}</span>
                  </span>
                  <span className="font-mono-num text-xs" style={{ color: "var(--text-muted)" }}>
                    {activity.monsterHp ?? monster.maxHp} / {monster.maxHp}
                  </span>
                </div>
                <ProgressBar
                  fraction={(activity.monsterHp ?? monster.maxHp) / monster.maxHp}
                  color="linear-gradient(90deg, var(--blood), var(--blood-bright))"
                />
              </div>
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {character.name}
                  </span>
                  <span className="font-mono-num text-xs" style={{ color: "var(--text-muted)" }}>
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
            <div className="py-6 text-center text-sm italic" style={{ color: "var(--text-muted)" }}>
              Söker efter en fiende...
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

const navBtnStyle = { borderColor: "var(--panel-border)", color: "var(--gold)" };
