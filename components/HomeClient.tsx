"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WishItem } from "@/lib/db";
import { tagCountMap, tagIdsForItem, useWishBoxData } from "@/lib/useWishBoxData";
import { AddEditItemModal } from "./AddEditItemModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { Header } from "./Header";
import { ItemDetailModal } from "./ItemDetailModal";
import { ItemList } from "./ItemList";
import { Snackbar } from "./Snackbar";
import { SummaryBanner } from "./SummaryBanner";
import { TabsAndSort, type SortOption, type TabKey } from "./TabsAndSort";
import { TagFilterBar } from "./TagFilterBar";
import { TagManageModal } from "./TagManageModal";
import { WelcomeModal } from "./WelcomeModal";

const WELCOME_STORAGE_KEY = "wishbox-welcome-seen";
const UNDO_TIMEOUT_MS = 3000;
const FADE_OUT_MS = 300;

export function HomeClient() {
  const data = useWishBoxData();
  const { items, tags, itemTags } = data;

  const [activeTab, setActiveTab] = useState<TabKey>("buy");
  const [sortOption, setSortOption] = useState<SortOption>("priority");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishItem | null>(null);
  const [isTagManageOpen, setIsTagManageOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<WishItem | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);

  const [fadingItemId, setFadingItemId] = useState<string | null>(null);
  const [undoTarget, setUndoTarget] = useState<WishItem | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(WELCOME_STORAGE_KEY)) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    window.localStorage.setItem(WELCOME_STORAGE_KEY, "1");
    setShowWelcome(false);
  };

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const tagsByItemId = (itemId: string) => {
    const ids = tagIdsForItem(itemTags, itemId);
    return tags.filter((tag) => ids.includes(tag.id));
  };

  const tagCounts = useMemo(() => tagCountMap(itemTags), [itemTags]);

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => (activeTab === "buy" ? !item.is_purchased : item.is_purchased));

    if (selectedTagIds.length > 0) {
      list = list.filter((item) => {
        const ids = tagIdsForItem(itemTags, item.id);
        return selectedTagIds.some((tagId) => ids.includes(tagId));
      });
    }

    const sorted = [...list];
    switch (sortOption) {
      case "priority":
        sorted.sort((a, b) => b.priority_score - a.priority_score);
        break;
      case "recent":
        sorted.sort((a, b) => b.created_at - a.created_at);
        break;
      case "price_asc":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price_desc":
        sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
    }
    return sorted;
  }, [items, itemTags, activeTab, selectedTagIds, sortOption]);

  const emptyVariant = useMemo(() => {
    if (visibleItems.length > 0) return null;
    if (selectedTagIds.length > 0) return "filtered-empty" as const;
    if (activeTab === "bought") return "no-purchased" as const;
    return "no-items" as const;
  }, [visibleItems, selectedTagIds, activeTab]);

  const viewingItem = items.find((item) => item.id === viewingItemId) ?? null;

  const openAddModal = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: WishItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleEditFromDetail = () => {
    if (!viewingItem) return;
    setViewingItemId(null);
    openEditModal(viewingItem);
  };

  const handleToggle = async (item: WishItem) => {
    if (!item.is_purchased) {
      setFadingItemId(item.id);
      setTimeout(async () => {
        await data.togglePurchased(item.id, true);
        setFadingItemId(null);

        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setUndoTarget(item);
        undoTimerRef.current = setTimeout(() => setUndoTarget(null), UNDO_TIMEOUT_MS);
      }, FADE_OUT_MS);
    } else {
      await data.togglePurchased(item.id, false);
    }
  };

  const handleUndo = async () => {
    if (!undoTarget) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    await data.togglePurchased(undoTarget.id, false);
    setUndoTarget(null);
  };

  if (data.isLoading) {
    return <div className="flex flex-1 items-center justify-center text-gray">불러오는 중…</div>;
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      <Header onAddClick={openAddModal} />

      <TagFilterBar
        tags={tags}
        selectedTagIds={selectedTagIds}
        onToggleTag={(tagId) =>
          setSelectedTagIds((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
          )
        }
        onClearFilters={() => setSelectedTagIds([])}
        onManageTags={() => setIsTagManageOpen(true)}
      />

      <TabsAndSort
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {activeTab === "buy" && <SummaryBanner items={items} />}

      {emptyVariant ? (
        <EmptyState
          variant={emptyVariant}
          onPrimaryAction={emptyVariant === "filtered-empty" ? () => setSelectedTagIds([]) : openAddModal}
        />
      ) : (
        <ItemList
          items={visibleItems}
          tagsByItemId={tagsByItemId}
          fadingItemId={fadingItemId}
          onToggle={handleToggle}
          onRequestDelete={setDeletingItem}
          onView={(item) => setViewingItemId(item.id)}
        />
      )}

      <AddEditItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        tags={tags}
        onCreateTag={data.addTag}
        editingItem={editingItem}
        editingItemTagIds={editingItem ? tagIdsForItem(itemTags, editingItem.id) : []}
        onSubmit={async (input) => {
          if (editingItem) {
            await data.editItem(editingItem.id, input);
          } else {
            await data.addItem(input);
          }
        }}
      />

      <TagManageModal
        isOpen={isTagManageOpen}
        onClose={() => setIsTagManageOpen(false)}
        tags={tags}
        tagCounts={tagCounts}
        onCreateTag={data.addTag}
        onUpdateTag={data.editTag}
        onDeleteTag={data.removeTag}
      />

      <ConfirmDialog
        isOpen={deletingItem !== null}
        title={`'${deletingItem?.title}' 항목을 삭제할까요?`}
        description="삭제하면 되돌릴 수 없어요."
        onCancel={() => setDeletingItem(null)}
        onConfirm={async () => {
          if (!deletingItem) return;
          await data.removeItem(deletingItem.id);
          setDeletingItem(null);
        }}
      />

      {undoTarget && (
        <Snackbar message="산 것으로 이동했어요" actionLabel="되돌리기" onAction={handleUndo} />
      )}

      <ItemDetailModal
        item={viewingItem}
        tags={viewingItem ? tagsByItemId(viewingItem.id) : []}
        onClose={() => setViewingItemId(null)}
        onEdit={handleEditFromDetail}
      />

      <WelcomeModal isOpen={showWelcome} onClose={dismissWelcome} />
    </div>
  );
}
