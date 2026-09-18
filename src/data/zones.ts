import { ZoneDef } from "@/lib/types";

export const ZONES: Record<string, ZoneDef> = {
  sunken_crypt: {
    id: "sunken_crypt",
    name: "Den sjunkna kryptan",
    emoji: "🏚️",
    description:
      "En rasad gravkammare djupt under staden. Råttor och benrangel rör sig i mörkret, och något äldre viskar längst in.",
    recommendedLevel: 1,
    requiredAttackLevel: 1,
    monsterIds: ["crypt_rat", "bone_skeleton", "crypt_wraith"],
  },
};

export const ZONE_ORDER: string[] = Object.keys(ZONES);
