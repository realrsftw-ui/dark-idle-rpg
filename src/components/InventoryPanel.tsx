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
    <div className="flex flex-col gap-8">
      <Panel title="Utrustning">
        <div className="flex flex-col">
          {SLOT_ORDER.map((slot, i) => {
            const itemId = character.equipment[slot];
            const item = itemId ? ITEMS[itemId] : null;
            return (
              <div key={slot}>
                {i > 0 && <div className="rule-full" />}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-baseline gap-3">
                    <span className="label-caps w-14 shrink-0">{SLOT_LABEL[slot]}</span>
                    <span
                      className="text-sm"
                      style={{ color: item ? RARITY_COLOR[item.rarity] : "var(--text-faint)" }}
                    >
                      {item ? item.name : "— tomt —"}
                    </span>
                  </div>
                  {item && (
                    <button
                      onClick={() => unequip(slot)}
                      className="label-caps hover:opacity-100"
                      style={{ opacity: 0.6 }}
                    >
                      Ta av
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Inventarie">
        {character.inventory.length === 0 ? (
          <div className="text-sm italic" style={{ color: "var(--text-faint)" }}>
            Din packning är tom.
          </div>
        ) : (
          <div className="flex flex-col">
            {character.inventory.map((stack, i) => {
              const item = ITEMS[stack.itemId];
              if (!item) return null;
              const equippable = !!item.slot;
              const canEquipNow = equippable && canEquip(item.id);
              return (
                <div key={stack.itemId}>
                  {i > 0 && <div className="rule-full" />}
                  <div className="flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm" style={{ color: RARITY_COLOR[item.rarity] }}>
                          {item.name}
                        </span>
                        <span className="font-mono-num text-xs" style={{ color: "var(--text-faint)" }}>
                          ×{stack.qty}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs italic" style={{ color: "var(--text-faint)" }}>
                        {RARITY_LABEL[item.rarity]}
                        {item.requirements &&
                          " · Kräver " +
                            Object.entries(item.requirements)
                              .map(([k, v]) => `${k.toUpperCase()} ${v}`)
                              .join(", ")}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      {equippable && (
                        <button
                          onClick={() => equip(item.id, item.slot!)}
                          disabled={!canEquipNow}
                          className="label-caps disabled:opacity-20"
                          style={{ color: "var(--gold-bright)" }}
                        >
                          Använd
                        </button>
                      )}
                      <button
                        onClick={() => sellItem(item.id, 1)}
                        className="label-caps"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Sälj · {item.sellPrice}
                      </button>
                    </div>
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
