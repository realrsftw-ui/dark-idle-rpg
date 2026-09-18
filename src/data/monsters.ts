import { MonsterDef } from "@/lib/types";

export const MONSTERS: Record<string, MonsterDef> = {
  crypt_rat: {
    id: "crypt_rat",
    name: "Kryptråtta",
    emoji: "🐀",
    level: 1,
    maxHp: 12,
    attack: 3,
    defense: 1,
    minDamage: 1,
    maxDamage: 2,
    expReward: 12,
    goldMin: 1,
    goldMax: 4,
    lootTable: [
      { itemId: "copper_ore", chance: 0.25, minQty: 1, maxQty: 2 },
      { itemId: "rusty_dagger", chance: 0.03 },
    ],
  },
  bone_skeleton: {
    id: "bone_skeleton",
    name: "Benskelett",
    emoji: "💀",
    level: 5,
    maxHp: 28,
    attack: 6,
    defense: 4,
    minDamage: 2,
    maxDamage: 5,
    expReward: 30,
    goldMin: 4,
    goldMax: 12,
    lootTable: [
      { itemId: "wooden_buckler", chance: 0.08 },
      { itemId: "leather_hood", chance: 0.06 },
      { itemId: "iron_sword", chance: 0.02 },
    ],
  },
  crypt_wraith: {
    id: "crypt_wraith",
    name: "Kryptvålnad",
    emoji: "👻",
    level: 10,
    maxHp: 48,
    attack: 10,
    defense: 7,
    minDamage: 4,
    maxDamage: 9,
    expReward: 60,
    goldMin: 10,
    goldMax: 25,
    lootTable: [
      { itemId: "iron_kiteshield", chance: 0.05 },
      { itemId: "iron_helm", chance: 0.05 },
      { itemId: "shadowweave_robe", chance: 0.015 },
      { itemId: "bonecleaver", chance: 0.01 },
    ],
  },
};

export const CRYPT_ZONE_MONSTER_IDS = ["crypt_rat", "bone_skeleton", "crypt_wraith"];
