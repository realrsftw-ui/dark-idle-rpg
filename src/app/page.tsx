"use client";

import { useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { CharacterCreate } from "@/components/CharacterCreate";
import { Header } from "@/components/Header";
import { SkillsPanel } from "@/components/SkillsPanel";
import { ActivityLog } from "@/components/ActivityLog";
import { AnnouncementsPanel } from "@/components/AnnouncementsPanel";
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
      <div className="text-sm font-bold" style={{ color: "var(--text-faint)" }}>
        VÄCKER MÖRKRET TILL LIV...
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
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 px-3 py-3 md:flex-row">
        <div className="flex flex-col gap-3 md:w-64 md:shrink-0">
          <SkillsPanel />
          <AnnouncementsPanel />
          <ActivityLog />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex" style={{ background: "var(--panel-header)", border: "1px solid var(--border)" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 py-1.5 text-center text-[11px] font-bold"
                style={{
                  background: tab === t.id ? "var(--panel)" : "transparent",
                  color: tab === t.id ? "var(--yellow)" : "var(--text-dim)",
                }}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          {tab === "zones" && <WorldExplorer />}
          {tab === "inventory" && <InventoryPanel />}
          {tab === "shop" && <ShopPanel />}
        </div>
      </main>

      <footer style={{ background: "var(--bg-deep)", borderTop: "1px solid var(--border)" }}>
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-5 gap-y-1 px-3 py-2 text-[11px]">
          {["Manual", "Kartor", "Spelregler", "Topplistor", "Stöd oss"].map((label) => (
            <span key={label} style={{ color: "var(--gold)" }}>
              {label}
            </span>
          ))}
        </div>
      </footer>
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
