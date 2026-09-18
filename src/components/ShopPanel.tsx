"use client";

import { useGame } from "@/context/GameContext";
import { ITEMS, ITEM_ORDER } from "@/data/items";
import { Panel } from "@/components/ui/Panel";
import { RARITY_COLOR, RARITY_LABEL } from "@/lib/rarity";

export function ShopPanel() {
  const { character, buyItem } = useGame();
  if (!character) return null;

  const shopItems = ITEM_ORDER.map((id) => ITEMS[id]).filter((item) => item.buyPrice > 0);

  return (
    <Panel title="Handelsman Ashkars bod">
      <div className="flex flex-col">
        {shopItems.map((item, i) => {
          const affordable = character.gold >= item.buyPrice;
          return (
            <div key={item.id}>
              {i > 0 && <div className="rule-full" />}
              <div className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <span className="text-sm" style={{ color: RARITY_COLOR[item.rarity] }}>
                    {item.name}
                  </span>
                  <div className="mt-0.5 text-xs italic" style={{ color: "var(--text-faint)" }}>
                    {RARITY_LABEL[item.rarity]}
                  </div>
                </div>
                <button
                  onClick={() => buyItem(item.id)}
                  disabled={!affordable}
                  className="label-caps shrink-0 disabled:opacity-20"
                  style={{ color: "var(--gold-bright)" }}
                >
                  Köp · {item.buyPrice}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
