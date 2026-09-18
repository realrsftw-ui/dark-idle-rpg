"use client";

import { useGame } from "@/context/GameContext";
import { ITEMS } from "@/data/items";
import { Panel } from "@/components/ui/Panel";
import { ItemIcon, RARITY_LABEL } from "@/components/ui/ItemIcon";
import { EquipSlot } from "@/lib/types";

const SLOT_ORDER: EquipSlot[] = ["weapon", "shield", "head", "body", "legs", "hands"];
const SLOT_LABEL: Record<EquipSlot, string> = {
  weapon: "Vapen",
  shield: "Sköld",
  head: "Huvud",
  body: "Kropp",
  legs: "Ben",
  hands: "Händer",
};
const SLOT_EMOJI: Record<EquipSlot, string> = {
  weapon: "⚔️",
  shield: "🛡️",
  head: "🪖",
  body: "🧥",
  legs: "👖",
  hands: "🧤",
};

export function InventoryPanel() {
  const { character, equip, unequip, sellItem, canEquip } = useGame();
  if (!character) return null;

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Utrustning" icon="🛡️">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SLOT_ORDER.map((slot) => {
            const itemId = character.equipment[slot];
            const item = itemId ? ITEMS[itemId] : null;
            return (
              <div
                key={slot}
                className="flex items-center gap-2 rounded-md border p-2"
                style={{ borderColor: "var(--panel-border)" }}
              >
                {item ? (
                  <ItemIcon emoji={item.emoji} rarity={item.rarity} size={38} />
                ) : (
                  <div
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md text-lg opacity-40"
                    style={{ border: "2px dashed var(--panel-border)" }}
                  >
                    {SLOT_EMOJI[slot]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--text-faint)]">
                    {SLOT_LABEL[slot]}
                  </div>
                  <div className="truncate text-xs font-medium">{item ? item.name : "Tomt"}</div>
                </div>
                {item && (
                  <button
                    onClick={() => unequip(slot)}
                    className="shrink-0 text-[11px] text-[var(--text-faint)] hover:text-[var(--blood-bright)]"
                  >
                    Ta av
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Inventarie" icon="🎒">
        {character.inventory.length === 0 ? (
          <div className="py-6 text-center text-sm text-[var(--text-faint)]">Din packning är tom.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {character.inventory.map((stack) => {
              const item = ITEMS[stack.itemId];
              if (!item) return null;
              const equippable = !!item.slot;
              const canEquipNow = equippable && canEquip(item.id);
              return (
                <div
                  key={stack.itemId}
                  className="flex items-center gap-3 rounded-md border p-2.5"
                  style={{ borderColor: "var(--panel-border)" }}
                >
                  <ItemIcon emoji={item.emoji} rarity={item.rarity} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {item.name}
                      <span className="text-xs text-[var(--text-faint)]">x{stack.qty}</span>
                    </div>
                    <div className="text-[11px]" style={{ color: `var(--rarity-${item.rarity})` }}>
                      {RARITY_LABEL[item.rarity]}
                    </div>
                    {item.requirements && (
                      <div className="text-[10px] text-[var(--text-faint)]">
                        Kräver{" "}
                        {Object.entries(item.requirements)
                          .map(([k, v]) => `${k.toUpperCase()} ${v}`)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {equippable && (
                      <button
                        onClick={() => equip(item.id, item.slot!)}
                        disabled={!canEquipNow}
                        className="rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-30"
                        style={{ borderColor: "var(--gold)", color: "var(--gold-bright)" }}
                      >
                        Använd
                      </button>
                    )}
                    <button
                      onClick={() => sellItem(item.id, 1)}
                      className="rounded-md border px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]"
                      style={{ borderColor: "var(--panel-border)" }}
                    >
                      Sälj ({item.sellPrice}🪙)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
