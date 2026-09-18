import { RegionDef } from "@/lib/types";

export const REGIONS: Record<string, RegionDef> = {
  askharad: {
    id: "askharad",
    name: "Askhärad",
    emoji: "🕯️",
    description: "Landet kring din hemstad, där askan från gamla bränder aldrig riktigt lade sig.",
    requiredCombatLevel: 1,
    zoneIds: ["sunken_crypt", "outskirt_paths"],
  },
  vildmarken: {
    id: "vildmarken",
    name: "Vildmarken",
    emoji: "🌑",
    description:
      "Bortom Askhärads gränser breder den lagoreglerade vildmarken ut sig — här gäller andra, äldre lagar.",
    requiredCombatLevel: 10,
    zoneIds: ["ghost_woods", "forgotten_ruins"],
  },
};

export const REGION_ORDER: string[] = Object.keys(REGIONS);
