"use client";

import { useState } from "react";
import type { Tag } from "@/lib/db";
import { nextTagColor } from "@/lib/format";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

const COLOR_OPTIONS = ["#3555D8", "#FF6452", "#4C9A6A", "#B8860B", "#8A5CF6", "#DB4E9C"];

export function TagManageModal({
  isOpen,
  onClose,
  tags,
  tagCounts,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  tagCounts: Record<string, number>;
  onCreateTag: (name: string, color: string) => Promise<Tag>;
  onUpdateTag: (id: string, name: string, color: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const usedTags = tags.filter((tag) => (tagCounts[tag.id] ?? 0) > 0);
  const unusedTags = tags.filter((tag) => (tagCounts[tag.id] ?? 0) === 0);

  const startEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = async () => {
    if (!editingTagId || !editName.trim()) return;
    await onUpdateTag(editingTagId, editName.trim(), editColor);
    setEditingTagId(null);
  };

  const submitNewTag = async () => {
    const name = newName.trim();
    if (!name) {
      setIsAddingNew(false);
      return;
    }
    await onCreateTag(name, nextTagColor(tags.length));
    setNewName("");
    setIsAddingNew(false);
  };

  const renderTagRow = (tag: Tag) => {
    const isEditing = editingTagId === tag.id;
    const count = tagCounts[tag.id] ?? 0;

    if (isEditing) {
      return (
        <div key={tag.id} className="flex flex-col gap-2 rounded-lg border border-brand/40 p-2">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="h-9 flex-1 rounded-md border border-black/15 px-2 text-[14px] outline-none focus:border-brand"
            />
            <Button variant="primary" size="sm" onClick={saveEdit}>
              완료
            </Button>
          </div>
          <div className="flex gap-1.5">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setEditColor(color)}
                style={{ backgroundColor: color }}
                className={`size-5 shrink-0 rounded-full ${editColor === color ? "ring-2 ring-offset-1 ring-ink" : ""}`}
                aria-label={color}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={tag.id} className="flex items-center gap-2 rounded-lg p-2">
        <span className="size-3.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
        <span className="flex-1 truncate text-[14px] text-ink">{tag.name}</span>
        <span className="text-[12px] text-gray">({count}개 항목)</span>
        <button type="button" onClick={() => startEdit(tag)} className="px-1.5 text-[13px] font-medium text-brand">
          수정
        </button>
        <button
          type="button"
          onClick={() => setDeletingTag(tag)}
          className="px-1.5 text-[13px] font-medium text-coral"
        >
          삭제
        </button>
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} widthClassName="max-w-md">
        <h2 className="text-[20px] font-bold text-ink">태그 관리</h2>

        <div className="mt-4 flex flex-col gap-2">
          {isAddingNew && (
            <div className="flex items-center gap-2 rounded-lg border border-brand/40 p-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitNewTag()}
                placeholder="새 태그명"
                className="h-9 flex-1 rounded-md border border-black/15 px-2 text-[14px] outline-none focus:border-brand"
              />
              <Button variant="primary" size="sm" onClick={submitNewTag}>
                추가
              </Button>
            </div>
          )}

          {usedTags.map(renderTagRow)}

          {unusedTags.length > 0 && (
            <>
              <p className="mt-3 mb-1 text-[12px] text-gray">사용하지 않는 태그</p>
              {unusedTags.map(renderTagRow)}
            </>
          )}

          {tags.length === 0 && !isAddingNew && (
            <p className="py-6 text-center text-[14px] text-gray">등록된 태그가 없어요</p>
          )}
        </div>

        <Button variant="secondary" className="mt-4 w-full" onClick={() => setIsAddingNew(true)}>
          + 새 태그 추가
        </Button>
      </Modal>

      <ConfirmDialog
        isOpen={deletingTag !== null}
        title={`'${deletingTag?.name}' 태그를 삭제할까요?`}
        description={`이 태그가 붙은 ${deletingTag ? tagCounts[deletingTag.id] ?? 0 : 0}개 항목에서도 제거됩니다`}
        onCancel={() => setDeletingTag(null)}
        onConfirm={async () => {
          if (!deletingTag) return;
          await onDeleteTag(deletingTag.id);
          setDeletingTag(null);
        }}
        zIndexClassName="z-[60]"
      />
    </>
  );
}
