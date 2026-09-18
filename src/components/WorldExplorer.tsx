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
    let emoji = safe ? "·" : "";
    let name = "";
    if (cell.type === "zone" && cell.id) {
      emoji = ZONES[cell.id].emoji;
      name = ZONES[cell.id].name;
    } else if (cell.type === "training" && cell.id) {
      emoji = TRAINING_SPOTS[cell.id].emoji;
      name = TRAINING_SPOTS[cell.id].name;
    }
    return { inBounds: true as const, cell, safe, locked, emoji, name };
  }

  function tryMove(dx: number, dy: number) {
    move(dx, dy);
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Karta"
        icon="🗺️"
        right={
          <span className="text-xs text-[var(--text-faint)]">
            {hereIsSafe ? REGIONS.askharad.name : REGIONS.vildmarken.name} · ({pos.x},{pos.y})
          </span>
        }
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
          <div
            className="grid shrink-0 gap-1"
            style={{ gridTemplateColumns: `repeat(${VIEW_RADIUS * 2 + 1}, minmax(0,1fr))` }}
          >
            {cells.map((line, rowIdx) =>
              line.map((p, colIdx) => {
                const info = describeCell(p);
                const isHere = p.x === pos.x && p.y === pos.y;
                const isAdjacent =
                  (Math.abs(p.x - pos.x) === 1 && p.y === pos.y) ||
                  (Math.abs(p.y - pos.y) === 1 && p.x === pos.x);
                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    disabled={!info.inBounds || !isAdjacent || (info.inBounds && info.locked)}
                    onClick={() => isAdjacent && tryMove(p.x - pos.x, p.y - pos.y)}
                    title={info.inBounds ? info.name || (info.safe ? "" : "Vildmarken") : ""}
                    className="flex h-11 w-11 items-center justify-center rounded-md text-lg transition sm:h-12 sm:w-12"
                    style={{
                      border: isHere ? "2px solid var(--gold)" : "1px solid var(--panel-border)",
                      background: isHere
                        ? "rgba(212,175,55,0.12)"
                        : !info.inBounds
                          ? "var(--bg)"
                          : info.locked
                            ? "rgba(163,40,61,0.06)"
                            : "var(--bg-elevated)",
                      opacity: !info.inBounds ? 0.25 : isAdjacent || isHere ? 1 : 0.55,
                      cursor: isAdjacent ? "pointer" : "default",
                    }}
                  >
                    {isHere ? "🧙" : info.inBounds ? (info.locked ? "🔒" : info.emoji) : ""}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => tryMove(0, -1)}
              className="h-10 w-10 rounded-md border text-[var(--gold)]"
              style={{ borderColor: "var(--panel-border)" }}
            >
              ▲
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={() => tryMove(-1, 0)}
                className="h-10 w-10 rounded-md border text-[var(--gold)]"
                style={{ borderColor: "var(--panel-border)" }}
              >
                ◀
              </button>
              <button
                onClick={() => tryMove(0, 1)}
                className="h-10 w-10 rounded-md border text-[var(--gold)]"
                style={{ borderColor: "var(--panel-border)" }}
              >
                ▼
              </button>
              <button
                onClick={() => tryMove(1, 0)}
                className="h-10 w-10 rounded-md border text-[var(--gold)]"
                style={{ borderColor: "var(--panel-border)" }}
              >
                ▶
              </button>
            </div>
            <div className="mt-1 text-center text-[10px] leading-tight text-[var(--text-faint)]">
              Norr / Väster / Söder / Öster
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md border p-3" style={{ borderColor: "var(--panel-border)" }}>
          {here.type === "zone" && here.id ? (
            (() => {
              const zone = ZONES[here.id!];
              const locked = attackLevel < zone.requiredAttackLevel;
              return (
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{zone.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{zone.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{zone.description}</div>
                    <div className="mt-1 text-[11px] text-[var(--text-faint)]">
                      Rek. nivå {zone.recommendedLevel} · Kräver Attack {zone.requiredAttackLevel}
                    </div>
                  </div>
                  <button
                    onClick={() => startCombat(zone.id)}
                    disabled={locked || inCombat}
                    className="shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
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
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{spot.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{spot.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{spot.description}</div>
                    <div className="mt-1 text-[11px] text-[var(--text-faint)]">
                      Kräver nivå {spot.levelRequired} · +{spot.xpPerAction} EXP/tick
                    </div>
                  </div>
                  <button
                    onClick={() => startTraining(spot.id)}
                    disabled={locked || activeHere}
                    className="shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                    style={{ borderColor: "var(--gold)", color: "var(--gold-bright)" }}
                  >
                    {activeHere ? "Pågår" : locked ? "Låst" : "Träna"}
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="text-sm text-[var(--text-muted)]">{flavorFor(pos, pos.x * 31 + pos.y * 17)}</div>
          )}
        </div>

        {!hereIsSafe && (
          <div className="mt-2 text-center text-[11px] text-[var(--text-faint)]">
            Du är {chebyshevDistance(pos, SPAWN)} steg från Askhärad, ute i Vildmarken.
          </div>
        )}
        {hereIsSafe && cLevel < WILDERNESS_MIN_COMBAT_LEVEL && (
          <div className="mt-2 text-center text-[11px] text-[var(--text-faint)]">
            Vildmarken öppnar sig vid stridsnivå {WILDERNESS_MIN_COMBAT_LEVEL} (nu: {cLevel}) — {SAFE_RADIUS} steg
            från torget är du fortfarande trygg.
          </div>
        )}
      </Panel>

      {inCombat && (
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
