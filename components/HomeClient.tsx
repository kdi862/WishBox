"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WishItem } from "@/lib/db";
import { categoryCountMap, categoryIdsForItem, useWishBoxData } from "@/lib/useWishBoxData";
import { AddEditItemModal } from "./AddEditItemModal";
import { CategoryFilterBar } from "./CategoryFilterBar";
import { CategoryManageModal } from "./CategoryManageModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { Header } from "./Header";
import { ItemDetailModal } from "./ItemDetailModal";
import { ItemList } from "./ItemList";
import { Snackbar } from "./Snackbar";
import { SummaryBanner } from "./SummaryBanner";
import { TabsAndSort, type SortOption, type TabKey } from "./TabsAndSort";
import { WelcomeModal } from "./WelcomeModal";

const WELCOME_STORAGE_KEY = "wishbox-welcome-seen";
const UNDO_TIMEOUT_MS = 3000;

export function HomeClient() {
  const data = useWishBoxData();
  const { items, categories, itemCategories } = data;

  const [activeTab, setActiveTab] = useState<TabKey>("buy");
  const [sortOption, setSortOption] = useState<SortOption>("priority");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishItem | null>(null);
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<WishItem | null>(null);
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);

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

  const categoriesByItemId = (itemId: string) => {
    const ids = categoryIdsForItem(itemCategories, itemId);
    return categories.filter((category) => ids.includes(category.id));
  };

  const categoryCounts = useMemo(() => categoryCountMap(itemCategories), [itemCategories]);

  const visibleItems = useMemo(() => {
    let list = items.filter((item) => (activeTab === "buy" ? !item.is_purchased : item.is_purchased));

    if (selectedCategoryIds.length > 0) {
      list = list.filter((item) => {
        const ids = categoryIdsForItem(itemCategories, item.id);
        return selectedCategoryIds.some((categoryId) => ids.includes(categoryId));
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
  }, [items, itemCategories, activeTab, selectedCategoryIds, sortOption]);

  const emptyVariant = useMemo(() => {
    if (visibleItems.length > 0) return null;
    if (selectedCategoryIds.length > 0) return "filtered-empty" as const;
    if (activeTab === "bought") return "no-purchased" as const;
    return "no-items" as const;
  }, [visibleItems, selectedCategoryIds, activeTab]);

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

  const handleDeleteFromDetail = () => {
    if (!viewingItem) return;
    setViewingItemId(null);
    setDeletingItem(viewingItem);
  };

  const handleToggle = async (item: WishItem) => {
    const nextPurchased = !item.is_purchased;
    await data.togglePurchased(item.id, nextPurchased);

    if (nextPurchased) {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoTarget(item);
      undoTimerRef.current = setTimeout(() => setUndoTarget(null), UNDO_TIMEOUT_MS);
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

      <CategoryFilterBar
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onToggleCategory={(categoryId) =>
          setSelectedCategoryIds((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
          )
        }
        onClearFilters={() => setSelectedCategoryIds([])}
        onManageCategories={() => setIsCategoryManageOpen(true)}
      />

      <TabsAndSort
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {activeTab === "buy" && <SummaryBanner items={visibleItems} />}

      {emptyVariant ? (
        <EmptyState
          variant={emptyVariant}
          onPrimaryAction={emptyVariant === "filtered-empty" ? () => setSelectedCategoryIds([]) : openAddModal}
        />
      ) : (
        <ItemList
          items={visibleItems}
          categoriesByItemId={categoriesByItemId}
          onToggle={handleToggle}
          onRequestDelete={setDeletingItem}
          onView={(item) => setViewingItemId(item.id)}
        />
      )}

      <AddEditItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onCreateCategory={data.addCategory}
        editingItem={editingItem}
        editingItemCategoryIds={editingItem ? categoryIdsForItem(itemCategories, editingItem.id) : []}
        onSubmit={async (input) => {
          if (editingItem) {
            await data.editItem(editingItem.id, input);
          } else {
            await data.addItem(input);
          }
        }}
      />

      <CategoryManageModal
        isOpen={isCategoryManageOpen}
        onClose={() => setIsCategoryManageOpen(false)}
        categories={categories}
        categoryCounts={categoryCounts}
        onCreateCategory={data.addCategory}
        onUpdateCategory={data.editCategory}
        onDeleteCategory={data.removeCategory}
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
        categories={viewingItem ? categoriesByItemId(viewingItem.id) : []}
        onClose={() => setViewingItemId(null)}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      <WelcomeModal isOpen={showWelcome} onClose={dismissWelcome} />
    </div>
  );
}
