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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md border p-7" style={{ borderColor: "var(--gold)", background: "var(--bg)" }}>
        <h2 className="font-display text-center text-lg tracking-[0.1em]" style={{ color: "var(--gold)" }}>
          Medan du var borta
        </h2>
        <p className="mt-2 text-center text-sm italic" style={{ color: "var(--text-muted)" }}>
          {formatDuration(offlineSummary.elapsedMs)}
          {wasCapped && ` (begränsat till ${formatDuration(offlineSummary.cappedMs)})`}
        </p>

        <div className="rule my-5" />

        <div className="flex flex-col gap-4 text-sm">
          {xpEntries.length > 0 && (
            <div>
              <div className="label-caps mb-1.5">Erfarenhet</div>
              {xpEntries.map(([skillId, xp]) => (
                <div key={skillId} className="flex justify-between py-0.5">
                  <span>{SKILLS[skillId].name}</span>
                  <span className="font-mono-num" style={{ color: "var(--gold-bright)" }}>
                    +{xp.toLocaleString("sv-SE")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {offlineSummary.levelsGained.length > 0 && (
            <div>
              <div className="label-caps mb-1.5">Nya nivåer</div>
              {offlineSummary.levelsGained.map((lv) => (
                <div key={lv.skillId} className="py-0.5">
                  {SKILLS[lv.skillId].name}: {lv.from} → {lv.to}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <span className="label-caps">Guld</span>
            <span className="font-mono-num" style={{ color: "var(--gold-bright)" }}>
              +{offlineSummary.goldGained}
            </span>
          </div>

          {offlineSummary.itemsFound.length > 0 && (
            <div>
              <div className="label-caps mb-1.5">Föremål hittade</div>
              {offlineSummary.itemsFound.map((f) => (
                <div key={f.itemId} className="flex justify-between py-0.5">
                  <span>{ITEMS[f.itemId]?.name ?? f.itemId}</span>
                  <span className="font-mono-num">×{f.qty}</span>
                </div>
              ))}
            </div>
          )}

          {offlineSummary.deaths > 0 && (
            <div className="flex justify-between">
              <span className="label-caps" style={{ color: "var(--blood-bright)" }}>
                Dödsfall
              </span>
              <span className="font-mono-num" style={{ color: "var(--blood-bright)" }}>
                {offlineSummary.deaths}
              </span>
            </div>
          )}
        </div>

        <div className="rule my-5" />

        <button
          onClick={dismissOfflineSummary}
          className="section-title w-full border py-3 text-center"
          style={{ borderColor: "var(--gold)", color: "var(--gold-bright)" }}
        >
          Fortsätt
        </button>
      </div>
    </div>
  );
}
