import type { Tag, WishItem } from "@/lib/db";
import { ItemCard } from "./ItemCard";

export function ItemList({
  items,
  tagsByItemId,
  onToggle,
  onRequestDelete,
  onView,
}: {
  items: WishItem[];
  tagsByItemId: (itemId: string) => Tag[];
  onToggle: (item: WishItem) => void;
  onRequestDelete: (item: WishItem) => void;
  onView: (item: WishItem) => void;
}) {
  return (
    <ul className="flex flex-col gap-3 px-4 py-3 sm:px-6">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard
            item={item}
            tags={tagsByItemId(item.id)}
            onToggle={() => onToggle(item)}
            onRequestDelete={() => onRequestDelete(item)}
            onClick={() => onView(item)}
          />
        </li>
      ))}
    </ul>
  );
}
