"use client";

import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { ITEMS } from "@/data/items";
import {
  addItem,
  createCharacter as buildCharacter,
  equipItem as doEquip,
  meetsRequirements,
  removeItem,
  unequipItem as doUnequip,
} from "@/lib/character";
import { GameEvent, TICK_MS, processTick, simulateOfflineTicks } from "@/lib/engine";
import { loadSaveGame, writeSaveGame, SAVE_VERSION, clearSaveGame } from "@/lib/saveGame";
import { Activity, ActivityType, Character, EquipSlot, LogEntry, OfflineSummary, StatBlock } from "@/lib/types";

interface GameState {
  status: "loading" | "no-character" | "ready";
  character: Character | null;
  activity: Activity | null;
  log: LogEntry[];
  offlineSummary: OfflineSummary | null;
}

type Action =
  | { type: "NO_SAVE" }
  | { type: "LOAD"; character: Character; activity: Activity | null; log: LogEntry[] }
  | { type: "CREATE_CHARACTER"; character: Character }
  | { type: "SET_ACTIVITY"; activity: Activity }
  | { type: "TICK"; character: Character; activity: Activity; entries: LogEntry[] }
  | { type: "APPLY_CHARACTER"; character: Character }
  | { type: "SHOW_OFFLINE_SUMMARY"; summary: OfflineSummary }
  | { type: "DISMISS_OFFLINE_SUMMARY" }
  | { type: "RESET" };

const LOG_LIMIT = 50;
const OFFLINE_SUMMARY_THRESHOLD_MS = 20_000;

let logIdCounter = 1;

function formatEvent(ev: GameEvent): { message: string; kind: LogEntry["kind"] } {
  switch (ev.type) {
    case "spawn":
      return { message: `${ev.emoji} ${ev.monsterName} dyker upp ur mörkret.`, kind: "info" };
    case "player_hit":
      return { message: `Du träffar ${ev.monsterName} för ${ev.damage} skada.`, kind: "damage" };
    case "player_miss":
      return { message: `Du missar ${ev.monsterName}.`, kind: "info" };
    case "monster_hit":
      return { message: `${ev.monsterName} träffar dig för ${ev.damage} skada.`, kind: "damage" };
    case "monster_miss":
      return { message: `${ev.monsterName} missar dig.`, kind: "info" };
    case "monster_defeated":
      return {
        message: `Du besegrade ${ev.monsterName}! (+${ev.xp} EXP, +${ev.gold} guld)`,
        kind: "gold",
      };
    case "loot":
      return { message: `Du hittade ${ev.qty}x ${ev.itemName}.`, kind: "loot" };
    case "player_died":
      return { message: `${ev.monsterName} fällde dig. Du vaknar upp snart igen...`, kind: "death" };
    case "player_revived":
      return { message: "Du reser dig upp igen, redo att fortsätta.", kind: "info" };
    case "levelup":
      return { message: `🎉 ${ev.skillName} är nu nivå ${ev.level}!`, kind: "levelup" };
    case "gather":
      return { message: `Du samlade ${ev.qty}x ${ev.itemName} (+${ev.xp} EXP i ${ev.skillName}).`, kind: "loot" };
    case "gold":
      return { message: `Du hittade ${ev.amount} guld.`, kind: "gold" };
  }
}

function toLogEntries(events: GameEvent[]): LogEntry[] {
  return events.map((ev) => {
    const { message, kind } = formatEvent(ev);
    return { id: logIdCounter++, message, kind, timestamp: Date.now() };
  });
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "NO_SAVE":
      return { ...state, status: "no-character" };
    case "LOAD":
      return { ...state, status: "ready", character: action.character, activity: action.activity, log: action.log };
    case "CREATE_CHARACTER":
      return { ...state, status: "ready", character: action.character, activity: null, log: [] };
    case "SET_ACTIVITY":
      return { ...state, activity: action.activity };
    case "TICK":
      return {
        ...state,
        character: action.character,
        activity: action.activity,
        log: [...state.log, ...action.entries].slice(-LOG_LIMIT),
      };
    case "APPLY_CHARACTER":
      return { ...state, character: action.character };
    case "SHOW_OFFLINE_SUMMARY":
      return { ...state, offlineSummary: action.summary };
    case "DISMISS_OFFLINE_SUMMARY":
      return { ...state, offlineSummary: null };
    case "RESET":
      return { status: "no-character", character: null, activity: null, log: [], offlineSummary: null };
    default:
      return state;
  }
}

interface GameContextValue extends GameState {
  createCharacter: (name: string, stats: StatBlock) => void;
  startCombat: (zoneId: string) => void;
  startTraining: (spotId: string) => void;
  equip: (itemId: string, slot: EquipSlot) => void;
  unequip: (slot: EquipSlot) => void;
  buyItem: (itemId: string) => void;
  sellItem: (itemId: string, qty: number) => void;
  dismissOfflineSummary: () => void;
  resetGame: () => void;
  canEquip: (itemId: string) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    status: "loading",
    character: null,
    activity: null,
    log: [],
    offlineSummary: null,
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const save = loadSaveGame();
    if (!save) {
      dispatch({ type: "NO_SAVE" });
      return;
    }
    let character = save.character;
    let activity = save.activity;
    const log: LogEntry[] = [];

    if (activity) {
      const elapsedMs = Date.now() - activity.lastProcessedAt;
      if (elapsedMs >= TICK_MS) {
        const result = simulateOfflineTicks(character, activity, elapsedMs);
        character = result.character;
        activity = result.activity;
        if (result.summary.cappedMs >= OFFLINE_SUMMARY_THRESHOLD_MS) {
          dispatch({ type: "SHOW_OFFLINE_SUMMARY", summary: result.summary });
        }
      }
    }

    dispatch({ type: "LOAD", character, activity, log });
  }, []);

  // Autosave whenever character/activity changes.
  useEffect(() => {
    if (state.status !== "ready" || !state.character) return;
    writeSaveGame({ version: SAVE_VERSION, character: state.character, activity: state.activity });
  }, [state.status, state.character, state.activity]);

  // Live tick loop.
  useEffect(() => {
    if (state.status !== "ready") return;
    const interval = setInterval(() => {
      const current = stateRef.current;
      if (!current.character || !current.activity) return;
      if (current.character.hp <= 0 && (current.activity.cooldownTicks ?? 0) === 0) return;
      const result = processTick(current.character, current.activity, Math.random);
      dispatch({
        type: "TICK",
        character: result.character,
        activity: { ...result.activity, lastProcessedAt: Date.now() },
        entries: toLogEntries(result.events),
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [state.status]);

  const createCharacter = useCallback((name: string, stats: StatBlock) => {
    const character = buildCharacter(name, stats);
    dispatch({ type: "CREATE_CHARACTER", character });
  }, []);

  const startActivity = useCallback(
    (type: ActivityType, targetId: string) => {
      const now = Date.now();
      dispatch({
        type: "SET_ACTIVITY",
        activity: {
          type,
          targetId,
          startedAt: now,
          lastProcessedAt: now,
          currentMonsterId: undefined,
          monsterHp: undefined,
          cooldownTicks: 0,
          trainingProgressTicks: 0,
        },
      });
    },
    []
  );

  const startCombat = useCallback((zoneId: string) => startActivity("combat", zoneId), [startActivity]);
  const startTraining = useCallback((spotId: string) => startActivity("training", spotId), [startActivity]);

  const canEquip = useCallback(
    (itemId: string) => {
      const character = stateRef.current.character;
      const item = ITEMS[itemId];
      if (!character || !item || !item.slot) return false;
      return meetsRequirements(character, item.requirements);
    },
    []
  );

  const equip = useCallback((itemId: string, slot: EquipSlot) => {
    const character = stateRef.current.character;
    if (!character) return;
    const item = ITEMS[itemId];
    if (!item || !meetsRequirements(character, item.requirements)) return;
    dispatch({ type: "APPLY_CHARACTER", character: doEquip(character, itemId, slot) });
  }, []);

  const unequip = useCallback((slot: EquipSlot) => {
    const character = stateRef.current.character;
    if (!character) return;
    dispatch({ type: "APPLY_CHARACTER", character: doUnequip(character, slot) });
  }, []);

  const buyItem = useCallback((itemId: string) => {
    const character = stateRef.current.character;
    const item = ITEMS[itemId];
    if (!character || !item || item.buyPrice <= 0 || character.gold < item.buyPrice) return;
    const withGold: Character = { ...character, gold: character.gold - item.buyPrice };
    dispatch({ type: "APPLY_CHARACTER", character: addItem(withGold, itemId, 1) });
  }, []);

  const sellItem = useCallback((itemId: string, qty: number) => {
    const character = stateRef.current.character;
    const item = ITEMS[itemId];
    const stack = character?.inventory.find((s) => s.itemId === itemId);
    if (!character || !item || !stack || stack.qty < qty) return;
    const withoutItem = removeItem(character, itemId, qty);
    dispatch({ type: "APPLY_CHARACTER", character: { ...withoutItem, gold: withoutItem.gold + item.sellPrice * qty } });
  }, []);

  const dismissOfflineSummary = useCallback(() => dispatch({ type: "DISMISS_OFFLINE_SUMMARY" }), []);

  const resetGame = useCallback(() => {
    clearSaveGame();
    dispatch({ type: "RESET" });
  }, []);

  const value: GameContextValue = {
    ...state,
    createCharacter,
    startCombat,
    startTraining,
    equip,
    unequip,
    buyItem,
    sellItem,
    dismissOfflineSummary,
    resetGame,
    canEquip,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
