"use client";

import { useGame } from "@/context/GameContext";
import { WILDERNESS_MIN_COMBAT_LEVEL } from "@/data/worldMap";
import { combatLevel } from "@/lib/engine";
import { Panel } from "@/components/ui/Panel";

const STATIC_ANNOUNCEMENTS: { color: string; text: string }[] = [
  { color: "var(--red)", text: "Askhärad: Vålnader har synts röra sig djupare in i kryptan igen." },
  { color: "var(--text)", text: "En handelskaravan från öster rapporteras försenad — priser kan stiga." },
  { color: "var(--orange)", text: "Vaktmästaren varnar: Vildmarken är farlig för de oförberedda." },
];

export function AnnouncementsPanel() {
  const { character } = useGame();
  if (!character) return null;
  const cLevel = combatLevel(character);
  const nearWilderness = cLevel >= WILDERNESS_MIN_COMBAT_LEVEL - 2 && cLevel < WILDERNESS_MIN_COMBAT_LEVEL;

  return (
    <Panel title="TILLKÄNNAGIVANDEN" bare>
      <div className="flex flex-col gap-1 text-[12px]">
        {cLevel >= WILDERNESS_MIN_COMBAT_LEVEL && (
          <div style={{ color: "var(--yellow)" }}>Vildmarken ligger öppen för dig. Vandra bortom Askhärads gränser.</div>
        )}
        {nearWilderness && (
          <div style={{ color: "var(--gold)" }}>
            Du närmar dig stridsnivå {WILDERNESS_MIN_COMBAT_LEVEL} — Vildmarken öppnar sig snart.
          </div>
        )}
        {STATIC_ANNOUNCEMENTS.map((a, i) => (
          <div key={i} style={{ color: a.color }}>
            {a.text}
          </div>
        ))}
      </div>
    </Panel>
  );
}
