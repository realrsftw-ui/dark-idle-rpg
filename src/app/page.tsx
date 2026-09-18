"use client";

import { useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { CharacterCreate } from "@/components/CharacterCreate";
import { Header } from "@/components/Header";
import { SkillsPanel } from "@/components/SkillsPanel";
import { ActivityLog } from "@/components/ActivityLog";
import { CombatPanel } from "@/components/CombatPanel";
import { TrainingPanel } from "@/components/TrainingPanel";
import { InventoryPanel } from "@/components/InventoryPanel";
import { ShopPanel } from "@/components/ShopPanel";
import { WelcomeBackModal } from "@/components/WelcomeBackModal";

type Tab = "zones" | "training" | "inventory" | "shop";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "zones", label: "Zoner", emoji: "🗺️" },
  { id: "training", label: "Träning", emoji: "⛏️" },
  { id: "inventory", label: "Inventarie", emoji: "🎒" },
  { id: "shop", label: "Butik", emoji: "🏪" },
];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-[var(--text-faint)]">Väcker mörkret till liv...</div>
    </div>
  );
}

function MainGame() {
  const [tab, setTab] = useState<Tab>("zones");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <WelcomeBackModal />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-5 md:flex-row">
        <div className="flex flex-col gap-4 md:w-72 md:shrink-0">
          <SkillsPanel />
          <ActivityLog />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <nav className="flex gap-1.5 overflow-x-auto rounded-lg border p-1" style={{ borderColor: "var(--panel-border)" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition"
                style={{
                  background: tab === t.id ? "var(--panel-alt)" : "transparent",
                  color: tab === t.id ? "var(--gold-bright)" : "var(--text-muted)",
                }}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "zones" && <CombatPanel />}
          {tab === "training" && <TrainingPanel />}
          {tab === "inventory" && <InventoryPanel />}
          {tab === "shop" && <ShopPanel />}
        </div>
      </main>
    </div>
  );
}

function GameShell() {
  const { status, character } = useGame();
  if (status === "loading") return <LoadingScreen />;
  if (status === "no-character" || !character) return <CharacterCreate />;
  return <MainGame />;
}

export default function Home() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
