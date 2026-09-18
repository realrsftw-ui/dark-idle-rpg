import { Rarity } from "@/lib/types";

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  legendary: "var(--rarity-legendary)",
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Vanlig",
  uncommon: "Ovanlig",
  rare: "Sällsynt",
  legendary: "Legendarisk",
};
