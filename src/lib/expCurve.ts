export const MAX_LEVEL = 99;

// Classic OSRS-style exponential curve: xp required grows ~1.104x per level.
function xpForLevel(level: number): number {
  let total = 0;
  for (let lvl = 1; lvl < level; lvl++) {
    total += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
  }
  return Math.floor(total / 4);
}

const LEVEL_XP_TABLE: number[] = Array.from({ length: MAX_LEVEL + 1 }, (_, lvl) =>
  lvl === 0 ? 0 : xpForLevel(lvl)
);

export function xpToReachLevel(level: number): number {
  const clamped = Math.min(Math.max(level, 1), MAX_LEVEL);
  return LEVEL_XP_TABLE[clamped];
}

export function levelForXp(xp: number): number {
  let level = 1;
  for (let lvl = MAX_LEVEL; lvl >= 1; lvl--) {
    if (xp >= LEVEL_XP_TABLE[lvl]) {
      level = lvl;
      break;
    }
  }
  return level;
}

export function xpProgress(xp: number) {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) {
    return { level, xp, currentLevelXp: LEVEL_XP_TABLE[MAX_LEVEL], nextLevelXp: LEVEL_XP_TABLE[MAX_LEVEL], fraction: 1 };
  }
  const currentLevelXp = LEVEL_XP_TABLE[level];
  const nextLevelXp = LEVEL_XP_TABLE[level + 1];
  const fraction = (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  return { level, xp, currentLevelXp, nextLevelXp, fraction };
}
