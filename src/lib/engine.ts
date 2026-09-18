import { ZONES } from "@/data/zones";
import { MONSTERS } from "@/data/monsters";
import { TRAINING_SPOTS } from "@/data/trainingSpots";
import { ITEMS } from "@/data/items";
import { SKILLS } from "@/data/skills";
import { Activity, Character, MonsterDef, OfflineSummary, SkillId } from "@/lib/types";
import { addItem, addSkillXp, computeMaxHp } from "@/lib/character";
import { hitChance, playerAccuracy, playerDefenseRating, playerMaxHit, rollInt } from "@/lib/combat";

export const TICK_MS = 4000;
export const OFFLINE_CAP_MS = 12 * 60 * 60 * 1000;
export const RESPAWN_TICKS = 1;
export const DEATH_COOLDOWN_TICKS = 3;
const COMBAT_XP_SPLIT: Record<"attack" | "strength" | "defense", number> = {
  attack: 0.4,
  strength: 0.4,
  defense: 0.2,
};

export type GameEvent =
  | { type: "spawn"; monsterName: string; emoji: string }
  | { type: "player_hit"; damage: number; monsterName: string }
  | { type: "player_miss"; monsterName: string }
  | { type: "monster_hit"; damage: number; monsterName: string }
  | { type: "monster_miss"; monsterName: string }
  | { type: "monster_defeated"; monsterName: string; xp: number; gold: number }
  | { type: "loot"; itemId: string; itemName: string; qty: number }
  | { type: "player_died"; monsterName: string }
  | { type: "player_revived" }
  | { type: "levelup"; skillName: string; level: number }
  | { type: "gather"; itemId: string; itemName: string; qty: number; skillName: string; xp: number }
  | { type: "gold"; amount: number };

export function combatLevel(character: Character): number {
  const { attack, strength, defense } = character.skills;
  return Math.round((attack.level + strength.level + defense.level) / 3);
}

function pickMonster(zoneId: string, character: Character, rng: () => number): MonsterDef | null {
  const zone = ZONES[zoneId];
  if (!zone) return null;
  const pool = zone.monsterIds.map((id) => MONSTERS[id]).filter((m): m is MonsterDef => !!m);
  if (pool.length === 0) return null;
  const level = combatLevel(character);
  const eligible = pool.filter((m) => m.level <= level + 3);
  const candidates = eligible.length > 0 ? eligible : [pool.reduce((a, b) => (a.level <= b.level ? a : b))];
  return candidates[Math.floor(rng() * candidates.length)];
}

function grantCombatXp(character: Character, expReward: number): { character: Character; events: GameEvent[] } {
  let c = character;
  const events: GameEvent[] = [];
  for (const [skillId, split] of Object.entries(COMBAT_XP_SPLIT) as [SkillId, number][]) {
    const amount = Math.max(1, Math.round(expReward * split));
    const result = addSkillXp(c, skillId, amount);
    c = result.character;
    if (result.leveledUp) {
      events.push({ type: "levelup", skillName: SKILLS[skillId].name, level: result.to });
    }
  }
  return { character: c, events };
}

function rollLoot(monster: MonsterDef, rng: () => number): { itemId: string; qty: number }[] {
  const drops: { itemId: string; qty: number }[] = [];
  for (const entry of monster.lootTable) {
    if (rng() < entry.chance) {
      const qty = rollInt(entry.minQty ?? 1, entry.maxQty ?? entry.minQty ?? 1, rng);
      drops.push({ itemId: entry.itemId, qty });
    }
  }
  return drops;
}

export function processTick(
  character: Character,
  activity: Activity,
  rng: () => number
): { character: Character; activity: Activity; events: GameEvent[] } {
  const events: GameEvent[] = [];
  let c = character;
  const a = { ...activity };

  if (a.type === "combat") {
    if ((a.cooldownTicks ?? 0) > 0) {
      a.cooldownTicks = (a.cooldownTicks ?? 0) - 1;
      if (a.cooldownTicks === 0 && c.hp <= 0) {
        c = { ...c, hp: computeMaxHp(c) };
        events.push({ type: "player_revived" });
      }
      return { character: c, activity: a, events };
    }

    if (!a.currentMonsterId || (a.monsterHp ?? 0) <= 0) {
      const monster = pickMonster(a.targetId, c, rng);
      if (!monster) return { character: c, activity: a, events };
      a.currentMonsterId = monster.id;
      a.monsterHp = monster.maxHp;
      events.push({ type: "spawn", monsterName: monster.name, emoji: monster.emoji });
      return { character: c, activity: a, events };
    }

    const monster = MONSTERS[a.currentMonsterId];
    if (!monster) return { character: c, activity: a, events };

    const pAcc = playerAccuracy(c);
    const pDef = playerDefenseRating(c);
    const mDef = monster.defense;

    if (rng() < hitChance(pAcc, mDef)) {
      const dmg = rollInt(1, playerMaxHit(c), rng);
      a.monsterHp = Math.max(0, (a.monsterHp ?? monster.maxHp) - dmg);
      events.push({ type: "player_hit", damage: dmg, monsterName: monster.name });
    } else {
      events.push({ type: "player_miss", monsterName: monster.name });
    }

    if ((a.monsterHp ?? 0) <= 0) {
      const gold = rollInt(monster.goldMin, monster.goldMax, rng);
      c = { ...c, gold: c.gold + gold };
      const xpResult = grantCombatXp(c, monster.expReward);
      c = xpResult.character;
      events.push({ type: "monster_defeated", monsterName: monster.name, xp: monster.expReward, gold });
      events.push(...xpResult.events);
      for (const drop of rollLoot(monster, rng)) {
        c = addItem(c, drop.itemId, drop.qty);
        events.push({ type: "loot", itemId: drop.itemId, itemName: ITEMS[drop.itemId]?.name ?? drop.itemId, qty: drop.qty });
      }
      a.currentMonsterId = undefined;
      a.monsterHp = undefined;
      a.cooldownTicks = RESPAWN_TICKS;
      return { character: c, activity: a, events };
    }

    const monsterAcc = monster.attack;
    if (rng() < hitChance(monsterAcc, pDef)) {
      const dmg = rollInt(monster.minDamage, monster.maxDamage, rng);
      c = { ...c, hp: Math.max(0, c.hp - dmg) };
      events.push({ type: "monster_hit", damage: dmg, monsterName: monster.name });
    } else {
      events.push({ type: "monster_miss", monsterName: monster.name });
    }

    if (c.hp <= 0) {
      c = { ...c, deaths: c.deaths + 1 };
      events.push({ type: "player_died", monsterName: monster.name });
      a.currentMonsterId = undefined;
      a.monsterHp = undefined;
      a.cooldownTicks = DEATH_COOLDOWN_TICKS;
    }

    return { character: c, activity: a, events };
  }

  if (a.type === "training") {
    const spot = TRAINING_SPOTS[a.targetId];
    if (!spot) return { character: c, activity: a, events };
    a.trainingProgressTicks = (a.trainingProgressTicks ?? 0) + 1;
    if (a.trainingProgressTicks >= spot.ticksPerAction) {
      a.trainingProgressTicks = 0;
      const xpResult = addSkillXp(c, spot.skillId, spot.xpPerAction);
      c = xpResult.character;
      if (spot.yieldsItemId) {
        c = addItem(c, spot.yieldsItemId, 1);
        events.push({
          type: "gather",
          itemId: spot.yieldsItemId,
          itemName: ITEMS[spot.yieldsItemId]?.name ?? spot.yieldsItemId,
          qty: 1,
          skillName: SKILLS[spot.skillId].name,
          xp: spot.xpPerAction,
        });
      }
      if (spot.yieldsGoldMin !== undefined) {
        const gold = rollInt(spot.yieldsGoldMin, spot.yieldsGoldMax ?? spot.yieldsGoldMin, rng);
        c = { ...c, gold: c.gold + gold };
        events.push({ type: "gold", amount: gold });
      }
      if (xpResult.leveledUp) {
        events.push({ type: "levelup", skillName: SKILLS[spot.skillId].name, level: xpResult.to });
      }
    }
    return { character: c, activity: a, events };
  }

  return { character: c, activity: a, events };
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateOfflineTicks(
  character: Character,
  activity: Activity,
  elapsedMs: number
): { character: Character; activity: Activity; summary: OfflineSummary } {
  const cappedMs = Math.min(elapsedMs, OFFLINE_CAP_MS);
  const ticks = Math.floor(cappedMs / TICK_MS);

  const rng = mulberry32(Math.floor(activity.startedAt) ^ Math.floor(cappedMs));
  let c = character;
  let a = { ...activity };

  const summary: OfflineSummary = {
    elapsedMs,
    cappedMs,
    xpGained: {},
    goldGained: 0,
    itemsFound: [],
    deaths: 0,
    levelsGained: [],
  };
  const skillStartLevels: Partial<Record<SkillId, number>> = {};
  for (const id of Object.keys(c.skills) as SkillId[]) {
    skillStartLevels[id] = c.skills[id].level;
  }
  const skillStartXp: Partial<Record<SkillId, number>> = {};
  for (const id of Object.keys(c.skills) as SkillId[]) {
    skillStartXp[id] = c.skills[id].xp;
  }
  const goldStart = c.gold;
  const itemTotals = new Map<string, number>();

  for (let i = 0; i < ticks; i++) {
    const result = processTick(c, a, rng);
    c = result.character;
    a = result.activity;
    for (const ev of result.events) {
      if (ev.type === "loot") itemTotals.set(ev.itemId, (itemTotals.get(ev.itemId) ?? 0) + ev.qty);
      if (ev.type === "gather") itemTotals.set(ev.itemId, (itemTotals.get(ev.itemId) ?? 0) + ev.qty);
      if (ev.type === "player_died") summary.deaths += 1;
    }
  }

  for (const id of Object.keys(c.skills) as SkillId[]) {
    const gained = (c.skills[id].xp ?? 0) - (skillStartXp[id] ?? 0);
    if (gained > 0) summary.xpGained[id] = gained;
    const from = skillStartLevels[id] ?? 1;
    const to = c.skills[id].level;
    if (to > from) summary.levelsGained.push({ skillId: id, from, to });
  }
  summary.goldGained = c.gold - goldStart;
  summary.itemsFound = Array.from(itemTotals.entries()).map(([itemId, qty]) => ({ itemId, qty }));

  a.lastProcessedAt = a.lastProcessedAt + ticks * TICK_MS;
  return { character: c, activity: a, summary };
}
