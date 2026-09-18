import { SKILL_ORDER } from "@/data/skills";
import { Character, EquipSlot, InventoryStack, SkillId, StatBlock } from "@/lib/types";
import { levelForXp, xpProgress } from "@/lib/expCurve";

export const STAT_POINT_POOL = 20;
export const STAT_BASE = 5;
export const STAT_MAX = 20;

export function emptyStats(): StatBlock {
  return { str: STAT_BASE, dex: STAT_BASE, int: STAT_BASE, wis: STAT_BASE, vit: STAT_BASE };
}

export function createCharacter(name: string, stats: StatBlock): Character {
  const skills = {} as Character["skills"];
  for (const id of SKILL_ORDER) {
    skills[id] = { level: 1, xp: 0 };
  }
  const character: Character = {
    name: name.trim() || "Namnlös vandrare",
    stats,
    skills,
    hp: 0,
    gold: 50,
    inventory: [],
    equipment: { weapon: null, shield: null, head: null, body: null, legs: null, hands: null },
    deaths: 0,
    createdAt: Date.now(),
  };
  character.hp = computeMaxHp(character);
  return character;
}

export function computeMaxHp(character: Character): number {
  const defenseLevel = character.skills.defense?.level ?? 1;
  return 10 + character.stats.vit * 2 + defenseLevel;
}

export function computeMaxMana(character: Character): number {
  return 10 + character.stats.wis * 3 + character.stats.int * 2;
}

export interface CombatBonuses {
  attack: number;
  defense: number;
  strengthDmg: number;
}

export function getSkillLevel(character: Character, id: SkillId): number {
  return character.skills[id]?.level ?? 1;
}

export function addSkillXp(
  character: Character,
  skillId: SkillId,
  amount: number
): { character: Character; leveledUp: boolean; from: number; to: number } {
  const prev = character.skills[skillId];
  const from = prev.level;
  const newXp = prev.xp + amount;
  const to = levelForXp(newXp);
  const nextCharacter: Character = {
    ...character,
    skills: {
      ...character.skills,
      [skillId]: { level: to, xp: newXp },
    },
  };
  return { character: nextCharacter, leveledUp: to > from, from, to };
}

export function skillProgress(character: Character, id: SkillId) {
  return xpProgress(character.skills[id]?.xp ?? 0);
}

export function addItem(character: Character, itemId: string, qty: number): Character {
  if (qty <= 0) return character;
  const inventory: InventoryStack[] = character.inventory.some((s) => s.itemId === itemId)
    ? character.inventory.map((s) => (s.itemId === itemId ? { ...s, qty: s.qty + qty } : s))
    : [...character.inventory, { itemId, qty }];
  return { ...character, inventory };
}

export function removeItem(character: Character, itemId: string, qty: number): Character {
  const stack = character.inventory.find((s) => s.itemId === itemId);
  if (!stack || stack.qty < qty) return character;
  const inventory =
    stack.qty === qty
      ? character.inventory.filter((s) => s.itemId !== itemId)
      : character.inventory.map((s) => (s.itemId === itemId ? { ...s, qty: s.qty - qty } : s));
  return { ...character, inventory };
}

export function equipItem(character: Character, itemId: string, slot: EquipSlot): Character {
  const stack = character.inventory.find((s) => s.itemId === itemId);
  if (!stack) return character;
  const currentlyEquipped = character.equipment[slot];
  let inventory = character.inventory
    .map((s) => (s.itemId === itemId ? { ...s, qty: s.qty - 1 } : s))
    .filter((s) => s.qty > 0);
  if (currentlyEquipped) {
    inventory = inventory.some((s) => s.itemId === currentlyEquipped)
      ? inventory.map((s) => (s.itemId === currentlyEquipped ? { ...s, qty: s.qty + 1 } : s))
      : [...inventory, { itemId: currentlyEquipped, qty: 1 }];
  }
  return {
    ...character,
    inventory,
    equipment: { ...character.equipment, [slot]: itemId },
  };
}

export function meetsRequirements(character: Character, requirements?: Partial<StatBlock>): boolean {
  if (!requirements) return true;
  return (Object.entries(requirements) as [keyof StatBlock, number][]).every(
    ([stat, min]) => character.stats[stat] >= min
  );
}

export function unequipItem(character: Character, slot: EquipSlot): Character {
  const itemId = character.equipment[slot];
  if (!itemId) return character;
  const withItemBack = addItem({ ...character, equipment: { ...character.equipment, [slot]: null } }, itemId, 1);
  return withItemBack;
}
