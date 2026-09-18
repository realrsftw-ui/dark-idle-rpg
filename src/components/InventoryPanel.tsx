"use client";

import { useGame } from "@/context/GameContext";
import { ITEMS } from "@/data/items";
import { Panel } from "@/components/ui/Panel";
import { RARITY_COLOR, RARITY_LABEL } from "@/lib/rarity";
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

export function InventoryPanel() {
  const { character, equip, unequip, sellItem, canEquip } = useGame();
  if (!character) return null;

  return (
    <div className="flex flex-col gap-3">
      <Panel title="UTRUSTNING">
        {SLOT_ORDER.map((slot) => {
          const itemId = character.equipment[slot];
          const item = itemId ? ITEMS[itemId] : null;
          return (
            <div key={slot} className="retro-row flex items-center justify-between py-1.5">
              <div className="flex items-baseline gap-3">
                <span className="label-caps w-14 shrink-0">{SLOT_LABEL[slot]}</span>
                <span style={{ color: item ? RARITY_COLOR[item.rarity] : "var(--text-faint)" }}>
                  {item ? item.name : "— tomt —"}
                </span>
              </div>
              {item && (
                <button onClick={() => unequip(slot)} className="label-caps">
                  [Ta av]
                </button>
              )}
            </div>
          );
        })}
      </Panel>

      <Panel title="INVENTARIE">
        {character.inventory.length === 0 ? (
          <div className="text-[12px] italic" style={{ color: "var(--text-faint)" }}>
            Din packning är tom.
          </div>
        ) : (
          character.inventory.map((stack) => {
            const item = ITEMS[stack.itemId];
            if (!item) return null;
            const equippable = !!item.slot;
            const canEquipNow = equippable && canEquip(item.id);
            return (
              <div key={stack.itemId} className="retro-row py-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span style={{ color: RARITY_COLOR[item.rarity] }}>{item.name}</span>{" "}
                    <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                      ×{stack.qty}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    {equippable && (
                      <button
                        onClick={() => equip(item.id, item.slot!)}
                        disabled={!canEquipNow}
                        className="label-caps"
                        style={{ color: canEquipNow ? "var(--yellow)" : "var(--text-faint)" }}
                      >
                        [Använd]
                      </button>
                    )}
                    <button onClick={() => sellItem(item.id, 1)} className="label-caps">
                      [Sälj {item.sellPrice}]
                    </button>
                  </div>
                </div>
                <div className="text-[11px] italic" style={{ color: "var(--text-faint)" }}>
                  {RARITY_LABEL[item.rarity]}
                  {item.requirements &&
                    " · Kräver " +
                      Object.entries(item.requirements)
                        .map(([k, v]) => `${k.toUpperCase()} ${v}`)
                        .join(", ")}
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}
