import { ITEMS } from "@/data/items";
import { Character } from "@/lib/types";
import { getSkillLevel } from "@/lib/character";

export interface CombatBonuses {
  attack: number;
  defense: number;
  strengthDmg: number;
}

export function getCombatBonuses(character: Character): CombatBonuses {
  const bonuses: CombatBonuses = { attack: 0, defense: 0, strengthDmg: 0 };
  for (const itemId of Object.values(character.equipment)) {
    if (!itemId) continue;
    const item = ITEMS[itemId];
    if (!item) continue;
    bonuses.attack += item.bonuses.attack ?? 0;
    bonuses.defense += item.bonuses.defense ?? 0;
    bonuses.strengthDmg += item.bonuses.strengthDmg ?? 0;
  }
  return bonuses;
}

export function playerAccuracy(character: Character): number {
  const attackLevel = getSkillLevel(character, "attack");
  const bonuses = getCombatBonuses(character);
  return attackLevel * 2 + character.stats.dex + bonuses.attack;
}

export function playerMaxHit(character: Character): number {
  const strengthLevel = getSkillLevel(character, "strength");
  const bonuses = getCombatBonuses(character);
  return Math.max(1, Math.floor(strengthLevel / 2 + character.stats.str / 4 + bonuses.strengthDmg));
}

export function playerDefenseRating(character: Character): number {
  const defenseLevel = getSkillLevel(character, "defense");
  const bonuses = getCombatBonuses(character);
  return defenseLevel * 2 + character.stats.vit * 0.5 + bonuses.defense;
}

export function hitChance(attackerAccuracy: number, defenderRating: number): number {
  const raw = attackerAccuracy / (attackerAccuracy + defenderRating + 1);
  return Math.min(0.95, Math.max(0.1, raw));
}

export function rollInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
