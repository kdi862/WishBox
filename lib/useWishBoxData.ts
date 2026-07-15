"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Category,
  type ItemCategory,
  type ItemInput,
  type WishItem,
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  fetchAll,
  setItemPurchased,
  updateCategory as updateCategoryInDb,
  updateItem as updateItemInDb,
} from "./db";
import { nextCategoryColor } from "./format";

const DEFAULT_CATEGORIES_SEEDED_KEY = "wishbox-default-categories-seeded";
const DEFAULT_CATEGORY_NAMES = ["생필품", "의류", "취미"];

async function seedDefaultCategoriesIfNeeded(existingCount: number) {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(DEFAULT_CATEGORIES_SEEDED_KEY)) return;

  if (existingCount === 0) {
    for (const [index, name] of DEFAULT_CATEGORY_NAMES.entries()) {
      await createCategory(name, nextCategoryColor(index));
    }
  }
  window.localStorage.setItem(DEFAULT_CATEGORIES_SEEDED_KEY, "1");
}

export function useWishBoxData() {
  const [items, setItems] = useState<WishItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemCategories, setItemCategories] = useState<ItemCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchAll();
    setItems(data.items);
    setCategories(data.categories);
    setItemCategories(data.itemCategories);
    return data;
  }, []);

  useEffect(() => {
    (async () => {
      const data = await refresh();
      await seedDefaultCategoriesIfNeeded(data.categories.length);
      await refresh();
      setIsLoading(false);
    })();
  }, [refresh]);

  const addItem = useCallback(
    async (input: ItemInput) => {
      const item = await createItem(input);
      await refresh();
      return item;
    },
    [refresh]
  );

  const editItem = useCallback(
    async (id: string, input: ItemInput) => {
      await updateItemInDb(id, input);
      await refresh();
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (id: string) => {
      await deleteItem(id);
      await refresh();
    },
    [refresh]
  );

  const togglePurchased = useCallback(
    async (id: string, isPurchased: boolean) => {
      await setItemPurchased(id, isPurchased);
      await refresh();
    },
    [refresh]
  );

  const addCategory = useCallback(
    async (name: string, color: string) => {
      const category = await createCategory(name, color);
      await refresh();
      return category;
    },
    [refresh]
  );

  const editCategory = useCallback(
    async (id: string, name: string, color: string) => {
      await updateCategoryInDb(id, name, color);
      await refresh();
    },
    [refresh]
  );

  const removeCategory = useCallback(
    async (id: string) => {
      await deleteCategory(id);
      await refresh();
    },
    [refresh]
  );

  return {
    items,
    categories,
    itemCategories,
    isLoading,
    refresh,
    addItem,
    editItem,
    removeItem,
    togglePurchased,
    addCategory,
    editCategory,
    removeCategory,
  };
}

export function categoryIdsForItem(itemCategories: ItemCategory[], itemId: string): string[] {
  return itemCategories.filter((link) => link.item_id === itemId).map((link) => link.category_id);
}

export function categoryCountMap(itemCategories: ItemCategory[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const link of itemCategories) {
    map[link.category_id] = (map[link.category_id] ?? 0) + 1;
  }
  return map;
}
