import { SkillDef, SkillId } from "@/lib/types";

export const SKILLS: Record<SkillId, SkillDef> = {
  attack: {
    id: "attack",
    name: "Attack",
    emoji: "⚔️",
    category: "combat",
    description: "Höjer träffchans i strid.",
  },
  strength: {
    id: "strength",
    name: "Styrka",
    emoji: "💪",
    category: "combat",
    description: "Höjer max skada i strid.",
  },
  defense: {
    id: "defense",
    name: "Försvar",
    emoji: "🛡️",
    category: "combat",
    description: "Minskar skada du tar i strid.",
  },
  mining: {
    id: "mining",
    name: "Gruvdrift",
    emoji: "⛏️",
    category: "gathering",
    description: "Bryt malm i gruvor för guld och material.",
  },
  woodcutting: {
    id: "woodcutting",
    name: "Skogshuggning",
    emoji: "🪓",
    category: "gathering",
    description: "Hugg ner träd för virke att sälja eller craft:a med.",
  },
};

export const SKILL_ORDER: SkillId[] = ["attack", "strength", "defense", "mining", "woodcutting"];
