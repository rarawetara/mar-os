import { ItemCard } from "./item-card";
import type { Item } from "@/lib/model/item";

export function ItemList({ items, emptyLabel }: { items: Item[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="px-5 text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-3 px-5">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}
