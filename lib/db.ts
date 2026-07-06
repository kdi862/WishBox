import Dexie, { type EntityTable } from "dexie";

export interface WishItem {
  id: string;
  title: string;
  price: number | null;
  purchase_link: string | null;
  image_url: string | null;
  memo: string | null;
  need_score: number;
  want_score: number;
  priority_score: number;
  is_purchased: boolean;
  created_at: number;
  updated_at: number;
  purchased_at: number | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: number;
}

export interface ItemTag {
  id?: number;
  item_id: string;
  tag_id: string;
}

class WishBoxDB extends Dexie {
  items!: EntityTable<WishItem, "id">;
  tags!: EntityTable<Tag, "id">;
  item_tags!: EntityTable<ItemTag, "id">;

  constructor() {
    super("wishbox");
    this.version(1).stores({
      items: "id, is_purchased, priority_score, created_at, price",
      tags: "id, &name",
      item_tags: "++id, item_id, tag_id, [item_id+tag_id]",
    });
  }
}

export const db = new WishBoxDB();

export function calcPriorityScore(needScore: number, wantScore: number) {
  return (needScore + wantScore) / 2;
}

export async function fetchAll() {
  const [items, tags, itemTags] = await Promise.all([
    db.items.toArray(),
    db.tags.toArray(),
    db.item_tags.toArray(),
  ]);
  return { items, tags, itemTags };
}

export interface ItemInput {
  title: string;
  price: number | null;
  purchase_link: string | null;
  image_url: string | null;
  memo: string | null;
  need_score: number;
  want_score: number;
  tagIds: string[];
}

export async function createItem(input: ItemInput) {
  const now = Date.now();
  const item: WishItem = {
    id: crypto.randomUUID(),
    title: input.title,
    price: input.price,
    purchase_link: input.purchase_link,
    image_url: input.image_url,
    memo: input.memo,
    need_score: input.need_score,
    want_score: input.want_score,
    priority_score: calcPriorityScore(input.need_score, input.want_score),
    is_purchased: false,
    created_at: now,
    updated_at: now,
    purchased_at: null,
  };

  await db.transaction("rw", db.items, db.item_tags, async () => {
    await db.items.add(item);
    await db.item_tags.bulkAdd(
      input.tagIds.map((tagId) => ({ item_id: item.id, tag_id: tagId }))
    );
  });

  return item;
}

export async function updateItem(id: string, input: ItemInput) {
  await db.transaction("rw", db.items, db.item_tags, async () => {
    const existing = await db.items.get(id);
    if (!existing) return;

    await db.items.update(id, {
      title: input.title,
      price: input.price,
      purchase_link: input.purchase_link,
      image_url: input.image_url,
      memo: input.memo,
      need_score: input.need_score,
      want_score: input.want_score,
      priority_score: calcPriorityScore(input.need_score, input.want_score),
      updated_at: Date.now(),
    });

    const currentLinks = await db.item_tags.where("item_id").equals(id).toArray();
    await db.item_tags.bulkDelete(currentLinks.map((link) => link.id!));
    await db.item_tags.bulkAdd(
      input.tagIds.map((tagId) => ({ item_id: id, tag_id: tagId }))
    );
  });
}

export async function deleteItem(id: string) {
  await db.transaction("rw", db.items, db.item_tags, async () => {
    await db.items.delete(id);
    const links = await db.item_tags.where("item_id").equals(id).toArray();
    await db.item_tags.bulkDelete(links.map((link) => link.id!));
  });
}

export async function setItemPurchased(id: string, isPurchased: boolean) {
  await db.items.update(id, {
    is_purchased: isPurchased,
    purchased_at: isPurchased ? Date.now() : null,
    updated_at: Date.now(),
  });
}

export async function createTag(name: string, color: string) {
  const tag: Tag = {
    id: crypto.randomUUID(),
    name,
    color,
    created_at: Date.now(),
  };
  await db.tags.add(tag);
  return tag;
}

export async function updateTag(id: string, name: string, color: string) {
  await db.tags.update(id, { name, color });
}

export async function deleteTag(id: string) {
  await db.transaction("rw", db.tags, db.item_tags, async () => {
    await db.tags.delete(id);
    const links = await db.item_tags.where("tag_id").equals(id).toArray();
    await db.item_tags.bulkDelete(links.map((link) => link.id!));
  });
}
