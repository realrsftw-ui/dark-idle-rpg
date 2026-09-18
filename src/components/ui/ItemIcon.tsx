import { Rarity } from "@/lib/types";

const RARITY_COLOR: Record<Rarity, string> = {
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

export function ItemIcon({
  emoji,
  rarity,
  size = 44,
  glow = false,
}: {
  emoji: string;
  rarity: Rarity;
  size?: number;
  glow?: boolean;
}) {
  const color = RARITY_COLOR[rarity];
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-md bg-[var(--bg-elevated)]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.52,
        border: `2px solid ${color}`,
        boxShadow: glow || rarity === "legendary" ? `0 0 10px ${color}99` : undefined,
      }}
    >
      {emoji}
    </div>
  );
}
