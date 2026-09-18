import { Position, WorldCell } from "@/lib/types";

export const GRID_MIN = 0;
export const GRID_MAX = 14;
export const SPAWN: Position = { x: 7, y: 7 };
export const SAFE_RADIUS = 2; // Chebyshev distance from SPAWN that never requires a combat level
export const WILDERNESS_MIN_COMBAT_LEVEL = 10;

function key(x: number, y: number): string {
  return `${x},${y}`;
}

// Sparse placement: most of the grid is empty wilderness/flavor squares,
// only specific coordinates hold a zone or training spot — mirrors how
// Shimlar's Wilderness is mostly empty ground between named locations.
const CELLS: Record<string, WorldCell> = {
  [key(7, 6)]: { type: "zone", id: "sunken_crypt" }, // N of spawn
  [key(7, 8)]: { type: "zone", id: "outskirt_paths" }, // S of spawn
  [key(6, 7)]: { type: "training", id: "copper_vein" }, // W of spawn
  [key(8, 7)]: { type: "training", id: "whispering_grove" }, // E of spawn
  [key(6, 6)]: { type: "training", id: "deep_vein" }, // NW of spawn (still gated by skill lvl)
  [key(7, 2)]: { type: "zone", id: "ghost_woods" }, // deep in Vildmarken, N
  [key(11, 7)]: { type: "zone", id: "forgotten_ruins" }, // deep in Vildmarken, E
};

export function chebyshevDistance(a: Position, b: Position): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function isSafeZone(pos: Position): boolean {
  return chebyshevDistance(pos, SPAWN) <= SAFE_RADIUS;
}

export function cellAt(pos: Position): WorldCell {
  return CELLS[key(pos.x, pos.y)] ?? { type: "empty" };
}

export function clampToGrid(pos: Position): Position {
  return {
    x: Math.min(GRID_MAX, Math.max(GRID_MIN, pos.x)),
    y: Math.min(GRID_MAX, Math.max(GRID_MIN, pos.y)),
  };
}

const WILDERNESS_FLAVOR = [
  "Ödemark. Vinden viskar genom torra grenar.",
  "Ingenting här utom sten och tystnad.",
  "Gamla hjulspår, sedan länge övergivna.",
  "Marken är svedd, som om något brunnit här för länge sedan.",
  "En kall vind drar genom det öppna landskapet.",
];

const STARTER_FLAVOR = [
  "Askhärads utkant. Trygg mark, åtminstone för nu.",
  "En stig kantad av gamla stenmurar.",
  "Doften av rök från stadens skorstenar hänger kvar i luften.",
];

export function flavorFor(pos: Position, seed: number): string {
  const pool = isSafeZone(pos) ? STARTER_FLAVOR : WILDERNESS_FLAVOR;
  return pool[Math.abs(seed) % pool.length];
}
