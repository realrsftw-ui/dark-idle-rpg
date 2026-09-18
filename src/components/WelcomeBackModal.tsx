"use client";

import { useGame } from "@/context/GameContext";
import { ITEMS } from "@/data/items";
import { SKILLS } from "@/data/skills";
import { SkillId } from "@/lib/types";

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours} tim ${minutes} min`;
}

export function WelcomeBackModal() {
  const { offlineSummary, dismissOfflineSummary } = useGame();
  if (!offlineSummary) return null;

  const xpEntries = Object.entries(offlineSummary.xpGained) as [SkillId, number][];
  const wasCapped = offlineSummary.elapsedMs > offlineSummary.cappedMs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="retro-panel w-full max-w-md">
        <div className="retro-header text-center">MEDAN DU VAR BORTA</div>
        <div className="p-3">
          <p className="mb-2 text-center text-[12px] italic" style={{ color: "var(--text-dim)" }}>
            {formatDuration(offlineSummary.elapsedMs)}
            {wasCapped && ` (begränsat till ${formatDuration(offlineSummary.cappedMs)})`}
          </p>

          {xpEntries.length > 0 && (
            <div className="retro-row py-1.5">
              <div className="label-caps mb-1">Erfarenhet</div>
              {xpEntries.map(([skillId, xp]) => (
                <div key={skillId} className="flex justify-between">
                  <span>{SKILLS[skillId].name}</span>
                  <span style={{ color: "var(--yellow)" }}>+{xp.toLocaleString("sv-SE")}</span>
                </div>
              ))}
            </div>
          )}

          {offlineSummary.levelsGained.length > 0 && (
            <div className="retro-row py-1.5">
              <div className="label-caps mb-1">Nya nivåer</div>
              {offlineSummary.levelsGained.map((lv) => (
                <div key={lv.skillId}>
                  {SKILLS[lv.skillId].name}: {lv.from} → {lv.to}
                </div>
              ))}
            </div>
          )}

          <div className="retro-row flex justify-between py-1.5">
            <span className="label-caps">Guld</span>
            <span style={{ color: "var(--gold)" }}>+{offlineSummary.goldGained}</span>
          </div>

          {offlineSummary.itemsFound.length > 0 && (
            <div className="retro-row py-1.5">
              <div className="label-caps mb-1">Föremål hittade</div>
              {offlineSummary.itemsFound.map((f) => (
                <div key={f.itemId} className="flex justify-between">
                  <span>{ITEMS[f.itemId]?.name ?? f.itemId}</span>
                  <span>×{f.qty}</span>
                </div>
              ))}
            </div>
          )}

          {offlineSummary.deaths > 0 && (
            <div className="flex justify-between py-1.5">
              <span className="label-caps" style={{ color: "var(--red)" }}>
                Dödsfall
              </span>
              <span style={{ color: "var(--red)" }}>{offlineSummary.deaths}</span>
            </div>
          )}

          <button
            onClick={dismissOfflineSummary}
            className="mt-3 w-full py-2 text-center font-bold"
            style={{ background: "var(--panel-header)", border: "1px solid var(--border)", color: "var(--yellow)" }}
          >
            Fortsätt
          </button>
        </div>
      </div>
    </div>
  );
}
