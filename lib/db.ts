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

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: number;
}

export interface ItemCategory {
  id?: number;
  item_id: string;
  category_id: string;
}

class WishBoxDB extends Dexie {
  items!: EntityTable<WishItem, "id">;
  categories!: EntityTable<Category, "id">;
  item_categories!: EntityTable<ItemCategory, "id">;

  constructor() {
    super("wishbox");
    this.version(1).stores({
      items: "id, is_purchased, priority_score, created_at, price",
      tags: "id, &name",
      item_tags: "++id, item_id, tag_id, [item_id+tag_id]",
    });
    this.version(2)
      .stores({
        items: "id, is_purchased, priority_score, created_at, price",
        tags: null,
        item_tags: null,
        categories: "id, &name",
        item_categories: "++id, item_id, category_id, [item_id+category_id]",
      })
      .upgrade(async (tx) => {
        const oldTags = await tx.table("tags").toArray();
        const oldItemTags = await tx.table("item_tags").toArray();
        await tx.table("categories").bulkAdd(oldTags);
        await tx.table("item_categories").bulkAdd(
          oldItemTags.map((link) => ({ item_id: link.item_id, category_id: link.tag_id }))
        );
      });
  }
}

export const db = new WishBoxDB();

export function calcPriorityScore(needScore: number, wantScore: number) {
  return (needScore + wantScore) / 2;
}

export async function fetchAll() {
  const [items, categories, itemCategories] = await Promise.all([
    db.items.toArray(),
    db.categories.toArray(),
    db.item_categories.toArray(),
  ]);
  return { items, categories, itemCategories };
}

export interface ItemInput {
  title: string;
  price: number | null;
  purchase_link: string | null;
  image_url: string | null;
  memo: string | null;
  need_score: number;
  want_score: number;
  categoryIds: string[];
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

  await db.transaction("rw", db.items, db.item_categories, async () => {
    await db.items.add(item);
    await db.item_categories.bulkAdd(
      input.categoryIds.map((categoryId) => ({ item_id: item.id, category_id: categoryId }))
    );
  });

  return item;
}

export async function updateItem(id: string, input: ItemInput) {
  await db.transaction("rw", db.items, db.item_categories, async () => {
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

    const currentLinks = await db.item_categories.where("item_id").equals(id).toArray();
    await db.item_categories.bulkDelete(currentLinks.map((link) => link.id!));
    await db.item_categories.bulkAdd(
      input.categoryIds.map((categoryId) => ({ item_id: id, category_id: categoryId }))
    );
  });
}

export async function deleteItem(id: string) {
  await db.transaction("rw", db.items, db.item_categories, async () => {
    await db.items.delete(id);
    const links = await db.item_categories.where("item_id").equals(id).toArray();
    await db.item_categories.bulkDelete(links.map((link) => link.id!));
  });
}

export async function setItemPurchased(id: string, isPurchased: boolean) {
  await db.items.update(id, {
    is_purchased: isPurchased,
    purchased_at: isPurchased ? Date.now() : null,
    updated_at: Date.now(),
  });
}

export async function createCategory(name: string, color: string) {
  const category: Category = {
    id: crypto.randomUUID(),
    name,
    color,
    created_at: Date.now(),
  };
  await db.categories.add(category);
  return category;
}

export async function updateCategory(id: string, name: string, color: string) {
  await db.categories.update(id, { name, color });
}

export async function deleteCategory(id: string) {
  await db.transaction("rw", db.categories, db.item_categories, async () => {
    await db.categories.delete(id);
    const links = await db.item_categories.where("category_id").equals(id).toArray();
    await db.item_categories.bulkDelete(links.map((link) => link.id!));
  });
}
