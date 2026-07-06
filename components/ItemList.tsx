import type { Tag, WishItem } from "@/lib/db";
import { ItemCard } from "./ItemCard";

export function ItemList({
  items,
  tagsByItemId,
  fadingItemId,
  onToggle,
  onRequestDelete,
  onEdit,
}: {
  items: WishItem[];
  tagsByItemId: (itemId: string) => Tag[];
  fadingItemId: string | null;
  onToggle: (item: WishItem) => void;
  onRequestDelete: (item: WishItem) => void;
  onEdit: (item: WishItem) => void;
}) {
  return (
    <ul className="flex flex-col gap-3 px-4 py-3 sm:px-6">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard
            item={item}
            tags={tagsByItemId(item.id)}
            isFading={fadingItemId === item.id}
            onToggle={() => onToggle(item)}
            onRequestDelete={() => onRequestDelete(item)}
            onClick={() => onEdit(item)}
          />
        </li>
      ))}
    </ul>
  );
}
