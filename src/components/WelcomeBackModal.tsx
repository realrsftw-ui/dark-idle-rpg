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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-lg border p-6"
        style={{ borderColor: "var(--gold)", background: "var(--panel)" }}
      >
        <div className="mb-1 text-center text-2xl">🌙</div>
        <h2 className="mb-1 text-center text-lg font-bold text-[var(--gold)]">Välkommen tillbaka</h2>
        <p className="mb-4 text-center text-xs text-[var(--text-muted)]">
          Du var borta i {formatDuration(offlineSummary.elapsedMs)}
          {wasCapped && ` (progression begränsad till ${formatDuration(offlineSummary.cappedMs)})`}.
        </p>

        <div className="flex flex-col gap-2 text-sm">
          {xpEntries.length > 0 && (
            <div className="rounded-md border p-3" style={{ borderColor: "var(--panel-border)" }}>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
                Erfarenhet
              </div>
              {xpEntries.map(([skillId, xp]) => (
                <div key={skillId} className="flex justify-between">
                  <span>
                    {SKILLS[skillId].emoji} {SKILLS[skillId].name}
                  </span>
                  <span className="font-mono text-[var(--gold-bright)]">+{xp.toLocaleString("sv-SE")}</span>
                </div>
              ))}
            </div>
          )}

          {offlineSummary.levelsGained.length > 0 && (
            <div className="rounded-md border p-3" style={{ borderColor: "var(--panel-border)" }}>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
                Nya nivåer
              </div>
              {offlineSummary.levelsGained.map((lv) => (
                <div key={lv.skillId}>
                  🎉 {SKILLS[lv.skillId].name}: {lv.from} → {lv.to}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between rounded-md border p-3" style={{ borderColor: "var(--panel-border)" }}>
            <span>🪙 Guld</span>
            <span className="font-mono text-[var(--gold-bright)]">+{offlineSummary.goldGained}</span>
          </div>

          {offlineSummary.itemsFound.length > 0 && (
            <div className="rounded-md border p-3" style={{ borderColor: "var(--panel-border)" }}>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
                Föremål hittade
              </div>
              {offlineSummary.itemsFound.map((f) => (
                <div key={f.itemId} className="flex justify-between">
                  <span>
                    {ITEMS[f.itemId]?.emoji} {ITEMS[f.itemId]?.name ?? f.itemId}
                  </span>
                  <span className="font-mono">x{f.qty}</span>
                </div>
              ))}
            </div>
          )}

          {offlineSummary.deaths > 0 && (
            <div className="flex justify-between rounded-md border p-3" style={{ borderColor: "var(--blood)" }}>
              <span>💀 Dödsfall</span>
              <span className="font-mono text-[var(--blood-bright)]">{offlineSummary.deaths}</span>
            </div>
          )}
        </div>

        <button
          onClick={dismissOfflineSummary}
          className="mt-5 w-full rounded-md py-2.5 font-semibold text-black"
          style={{ background: "var(--gold)" }}
        >
          Fortsätt
        </button>
      </div>
    </div>
  );
}
