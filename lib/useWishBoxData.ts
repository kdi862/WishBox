"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type ItemInput,
  type ItemTag,
  type Tag,
  type WishItem,
  createItem,
  createTag,
  deleteItem,
  deleteTag,
  fetchAll,
  setItemPurchased,
  updateItem as updateItemInDb,
  updateTag as updateTagInDb,
} from "./db";

export function useWishBoxData() {
  const [items, setItems] = useState<WishItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [itemTags, setItemTags] = useState<ItemTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchAll();
    setItems(data.items);
    setTags(data.tags);
    setItemTags(data.itemTags);
  }, []);

  useEffect(() => {
    (async () => {
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

  const addTag = useCallback(
    async (name: string, color: string) => {
      const tag = await createTag(name, color);
      await refresh();
      return tag;
    },
    [refresh]
  );

  const editTag = useCallback(
    async (id: string, name: string, color: string) => {
      await updateTagInDb(id, name, color);
      await refresh();
    },
    [refresh]
  );

  const removeTag = useCallback(
    async (id: string) => {
      await deleteTag(id);
      await refresh();
    },
    [refresh]
  );

  return {
    items,
    tags,
    itemTags,
    isLoading,
    refresh,
    addItem,
    editItem,
    removeItem,
    togglePurchased,
    addTag,
    editTag,
    removeTag,
  };
}

export function tagIdsForItem(itemTags: ItemTag[], itemId: string): string[] {
  return itemTags.filter((link) => link.item_id === itemId).map((link) => link.tag_id);
}

export function tagCountMap(itemTags: ItemTag[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const link of itemTags) {
    map[link.tag_id] = (map[link.tag_id] ?? 0) + 1;
  }
  return map;
}
