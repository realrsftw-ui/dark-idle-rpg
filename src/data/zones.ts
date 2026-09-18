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
  outskirt_paths: {
    id: "outskirt_paths",
    name: "Utkanternas stigar",
    emoji: "🌾",
    description:
      "De sista stigarna innan vildmarken tar vid. Vargar jagar i flock och rövare lurar bakom stenarna.",
    recommendedLevel: 1,
    requiredAttackLevel: 1,
    monsterIds: ["wild_wolf", "bandit_scout"],
  },
  ghost_woods: {
    id: "ghost_woods",
    name: "Spökskogen",
    emoji: "🌲",
    description:
      "Träden här har inte fällt löv på hundra år. Dimman viskar med röster av dem som gick vilse och aldrig hittade tillbaka.",
    recommendedLevel: 12,
    requiredAttackLevel: 10,
    monsterIds: ["forest_wraith", "corrupted_treant"],
  },
  forgotten_ruins: {
    id: "forgotten_ruins",
    name: "De glömda ruinerna",
    emoji: "🏛️",
    description:
      "Resterna av ett rike som föll i tysthet. Väktare som svor eviga eder vandrar fortfarande sina rundor.",
    recommendedLevel: 20,
    requiredAttackLevel: 18,
    monsterIds: ["ruin_guardian", "fallen_paladin"],
  },
};

export const ZONE_ORDER: string[] = Object.keys(ZONES);
