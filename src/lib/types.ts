export type StatId = "str" | "dex" | "int" | "wis" | "vit";

export type StatBlock = Record<StatId, number>;

export type SkillId =
  | "attack"
  | "strength"
  | "defense"
  | "mining"
  | "woodcutting";

export type SkillCategory = "combat" | "gathering";

export interface SkillDef {
  id: SkillId;
  name: string;
  emoji: string;
  category: SkillCategory;
  description: string;
}

export interface SkillState {
  level: number;
  xp: number;
}

export type EquipSlot = "weapon" | "shield" | "head" | "body" | "legs" | "hands";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface ItemDef {
  id: string;
  name: string;
  emoji: string;
  slot: EquipSlot | null; // null = not equippable (raw material)
  rarity: Rarity;
  description: string;
  requirements?: Partial<StatBlock>;
  bonuses: {
    attack?: number;
    defense?: number;
    strengthDmg?: number;
  };
  buyPrice: number;
  sellPrice: number;
}

export interface InventoryStack {
  itemId: string;
  qty: number;
}

export interface LootEntry {
  itemId: string;
  chance: number; // 0..1
  minQty?: number;
  maxQty?: number;
}

export interface MonsterDef {
  id: string;
  name: string;
  emoji: string;
  level: number;
  maxHp: number;
  attack: number;
  defense: number;
  minDamage: number;
  maxDamage: number;
  expReward: number;
  goldMin: number;
  goldMax: number;
  lootTable: LootEntry[];
}

export interface ZoneDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  recommendedLevel: number;
  requiredAttackLevel: number;
  monsterIds: string[];
}

export interface TrainingSpotDef {
  id: string;
  skillId: SkillId;
  name: string;
  emoji: string;
  description: string;
  levelRequired: number;
  xpPerAction: number;
  ticksPerAction: number;
  yieldsItemId?: string;
  yieldsGoldMin?: number;
  yieldsGoldMax?: number;
}

export type ActivityType = "combat" | "training";

export interface Activity {
  type: ActivityType;
  targetId: string; // zoneId for combat, trainingSpotId for training
  startedAt: number; // epoch ms
  lastProcessedAt: number; // epoch ms, last time we simulated ticks up to
  currentMonsterId?: string;
  monsterHp?: number;
  cooldownTicks?: number; // ticks remaining before next spawn / death recovery
  trainingProgressTicks?: number; // ticks accumulated toward current training action
}

export interface Character {
  name: string;
  stats: StatBlock;
  skills: Record<SkillId, SkillState>;
  hp: number;
  gold: number;
  inventory: InventoryStack[];
  equipment: Record<EquipSlot, string | null>;
  deaths: number;
  createdAt: number;
}

export interface LogEntry {
  id: number;
  message: string;
  kind: "info" | "damage" | "loot" | "levelup" | "death" | "gold";
  timestamp: number;
}

export interface SaveGame {
  version: number;
  character: Character;
  activity: Activity | null;
}

export interface OfflineSummary {
  elapsedMs: number;
  cappedMs: number;
  xpGained: Partial<Record<SkillId, number>>;
  goldGained: number;
  itemsFound: { itemId: string; qty: number }[];
  deaths: number;
  levelsGained: { skillId: SkillId; from: number; to: number }[];
}
