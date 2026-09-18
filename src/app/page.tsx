"use client";

import { useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { CharacterCreate } from "@/components/CharacterCreate";
import { Header } from "@/components/Header";
import { SkillsPanel } from "@/components/SkillsPanel";
import { ActivityLog } from "@/components/ActivityLog";
import { WorldExplorer } from "@/components/WorldExplorer";
import { InventoryPanel } from "@/components/InventoryPanel";
import { ShopPanel } from "@/components/ShopPanel";
import { WelcomeBackModal } from "@/components/WelcomeBackModal";

type Tab = "zones" | "inventory" | "shop";

const TABS: { id: Tab; label: string }[] = [
  { id: "zones", label: "Karta" },
  { id: "inventory", label: "Inventarie" },
  { id: "shop", label: "Butik" },
];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="font-display text-sm tracking-[0.1em]" style={{ color: "var(--text-faint)" }}>
        VÄCKER MÖRKRET TILL LIV
      </div>
    </div>
  );
}

function MainGame() {
  const [tab, setTab] = useState<Tab>("zones");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <WelcomeBackModal />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
        <div className="flex flex-col gap-8 md:w-72 md:shrink-0">
          <SkillsPanel />
          <ActivityLog />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <nav className="flex gap-6" style={{ borderBottom: "1px solid var(--panel-border)" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="section-title -mb-px border-b-2 pb-2.5"
                style={{
                  borderColor: tab === t.id ? "var(--gold)" : "transparent",
                  color: tab === t.id ? "var(--gold-bright)" : "var(--text-faint)",
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "zones" && <WorldExplorer />}
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
