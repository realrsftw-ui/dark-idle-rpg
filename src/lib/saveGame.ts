import { SaveGame } from "@/lib/types";

const SAVE_KEY = "saveGame";
export const SAVE_VERSION = 1;

export function loadSaveGame(): SaveGame | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveGame;
    if (!parsed || parsed.version !== SAVE_VERSION || !parsed.character) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSaveGame(save: SaveGame) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // storage full or unavailable - fail silently for v1
  }
}

export function clearSaveGame() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_KEY);
}
