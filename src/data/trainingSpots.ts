import { TrainingSpotDef } from "@/lib/types";

export const TRAINING_SPOTS: Record<string, TrainingSpotDef> = {
  copper_vein: {
    id: "copper_vein",
    skillId: "mining",
    name: "Kopparåder",
    emoji: "⛏️",
    description: "En lätt åtkomlig åder av kopparmalm nära gruvans ingång.",
    levelRequired: 1,
    xpPerAction: 8,
    ticksPerAction: 1,
    yieldsItemId: "copper_ore",
  },
  deep_vein: {
    id: "deep_vein",
    skillId: "mining",
    name: "Djupåder",
    emoji: "⛏️",
    description: "En rikare ådra längre in i de mörka gångarna. Kräver erfarenhet.",
    levelRequired: 15,
    xpPerAction: 18,
    ticksPerAction: 1,
    yieldsItemId: "copper_ore",
    yieldsGoldMin: 1,
    yieldsGoldMax: 3,
  },
  whispering_grove: {
    id: "whispering_grove",
    skillId: "woodcutting",
    name: "Viskande lunden",
    emoji: "🌲",
    description: "Förvridna ekar vid kryptans utkant, deras ved är märkligt tung.",
    levelRequired: 1,
    xpPerAction: 8,
    ticksPerAction: 1,
    yieldsItemId: "oak_log",
  },
};

export const TRAINING_SPOT_ORDER: string[] = Object.keys(TRAINING_SPOTS);
