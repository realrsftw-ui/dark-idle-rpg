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
    <Panel title="HANDELSMAN ASHKARS BOD">
      {shopItems.map((item) => {
        const affordable = character.gold >= item.buyPrice;
        return (
          <div key={item.id} className="retro-row flex items-center justify-between py-1.5">
            <div>
              <span style={{ color: RARITY_COLOR[item.rarity] }}>{item.name}</span>{" "}
              <span className="text-[11px] italic" style={{ color: "var(--text-faint)" }}>
                {RARITY_LABEL[item.rarity]}
              </span>
            </div>
            <button
              onClick={() => buyItem(item.id)}
              disabled={!affordable}
              className="label-caps shrink-0"
              style={{ color: affordable ? "var(--yellow)" : "var(--text-faint)" }}
            >
              [Köp {item.buyPrice}]
            </button>
          </div>
        );
      })}
    </Panel>
  );
}
