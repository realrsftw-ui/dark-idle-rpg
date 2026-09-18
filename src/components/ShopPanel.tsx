"use client";

import { useGame } from "@/context/GameContext";
import { ITEMS, ITEM_ORDER } from "@/data/items";
import { Panel } from "@/components/ui/Panel";
import { ItemIcon, RARITY_LABEL } from "@/components/ui/ItemIcon";

export function ShopPanel() {
  const { character, buyItem } = useGame();
  if (!character) return null;

  const shopItems = ITEM_ORDER.map((id) => ITEMS[id]).filter((item) => item.buyPrice > 0);

  return (
    <Panel title="Handelsman Ashkar's bod" icon="🏪">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {shopItems.map((item) => {
          const affordable = character.gold >= item.buyPrice;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md border p-2.5"
              style={{ borderColor: "var(--panel-border)" }}
            >
              <ItemIcon emoji={item.emoji} rarity={item.rarity} size={40} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-[11px]" style={{ color: `var(--rarity-${item.rarity})` }}>
                  {RARITY_LABEL[item.rarity]}
                </div>
              </div>
              <button
                onClick={() => buyItem(item.id)}
                disabled={!affordable}
                className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-30"
                style={{ borderColor: "var(--gold)", color: "var(--gold-bright)" }}
              >
                Köp ({item.buyPrice}🪙)
              </button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
