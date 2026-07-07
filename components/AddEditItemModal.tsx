"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { ItemInput, Tag, WishItem } from "@/lib/db";
import { isValidUrl, nextTagColor } from "@/lib/format";
import { SCORE_LABELS } from "@/lib/priority";
import { PriorityMatrixPreview } from "./PriorityMatrixPreview";
import { XIcon } from "./icons";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { Modal } from "./ui/Modal";

const MEMO_MAX = 200;
const DRAFT_STORAGE_KEY = "wishbox-new-item-draft";

interface ItemDraft {
  title: string;
  purchaseLink: string;
  priceInput: string;
  imageUrl: string | null;
  memo: string;
  selectedTagIds: string[];
  needScore: number;
  wantScore: number;
}

function loadDraft(): ItemDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ItemDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: ItemDraft) {
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function clearDraft() {
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function AddEditItemModal({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  editingItem,
  editingItemTagIds,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onCreateTag: (name: string, color: string) => Promise<Tag>;
  editingItem: WishItem | null;
  editingItemTagIds: string[];
  onSubmit: (input: ItemInput) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [purchaseLink, setPurchaseLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [needScore, setNeedScore] = useState(3);
  const [wantScore, setWantScore] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingItemTagIdsRef = useRef(editingItemTagIds);
  editingItemTagIdsRef.current = editingItemTagIds;

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setTitle(editingItem.title);
      setPurchaseLink(editingItem.purchase_link ?? "");
      setPriceInput(editingItem.price !== null ? String(editingItem.price) : "");
      setImageUrl(editingItem.image_url);
      setMemo(editingItem.memo ?? "");
      setSelectedTagIds(editingItemTagIdsRef.current);
      setNeedScore(editingItem.need_score);
      setWantScore(editingItem.want_score);
    } else {
      const draft = loadDraft();
      setTitle(draft?.title ?? "");
      setPurchaseLink(draft?.purchaseLink ?? "");
      setPriceInput(draft?.priceInput ?? "");
      setImageUrl(draft?.imageUrl ?? null);
      setMemo(draft?.memo ?? "");
      setSelectedTagIds(draft?.selectedTagIds ?? []);
      setNeedScore(draft?.needScore ?? 3);
      setWantScore(draft?.wantScore ?? 3);
    }
    setTitleError(null);
    setLinkError(null);
    setNewTagName("");
  }, [isOpen, editingItem]);

  useEffect(() => {
    if (!isOpen || editingItem) return;
    const isBlank =
      !title && !purchaseLink && !priceInput && !imageUrl && !memo && selectedTagIds.length === 0 && needScore === 3 && wantScore === 3;
    if (isBlank) {
      clearDraft();
      return;
    }
    saveDraft({ title, purchaseLink, priceInput, imageUrl, memo, selectedTagIds, needScore, wantScore });
  }, [isOpen, editingItem, title, purchaseLink, priceInput, imageUrl, memo, selectedTagIds, needScore, wantScore]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    const existing = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
    const tag = existing ?? (await onCreateTag(name, nextTagColor(tags.length)));

    setSelectedTagIds((prev) => (prev.includes(tag.id) ? prev : [...prev, tag.id]));
    setNewTagName("");
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("상품명을 입력해주세요.");
      return;
    }
    if (purchaseLink.trim() && !isValidUrl(purchaseLink.trim())) {
      setLinkError("올바른 URL 형식이 아니에요.");
      return;
    }

    const input: ItemInput = {
      title: trimmedTitle,
      price: priceInput ? Number(priceInput) : null,
      purchase_link: purchaseLink.trim() || null,
      image_url: imageUrl,
      memo: memo.trim() || null,
      need_score: needScore,
      want_score: wantScore,
      tagIds: selectedTagIds,
    };

    await onSubmit(input);
    if (!editingItem) clearDraft();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthClassName="max-w-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-ink">
          {editingItem ? "위시 항목 수정" : "새 위시 항목 추가"}
        </h2>
        <button type="button" onClick={onClose} aria-label="닫기" className="text-gray">
          <XIcon className="size-5" />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-ink">
            상품명 <span className="text-coral">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(null);
            }}
            placeholder="예) 무선 이어폰"
            className="h-11 w-full rounded-lg border border-black/15 px-3 text-[15px] outline-none focus:border-brand"
          />
          {titleError && <p className="mt-1 text-[12px] text-coral">{titleError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-[13px] text-gray">구매 링크</label>
            <input
              value={purchaseLink}
              onChange={(e) => {
                setPurchaseLink(e.target.value);
                if (linkError) setLinkError(null);
              }}
              placeholder="https://"
              className="h-11 w-full rounded-lg border border-black/15 px-3 text-[15px] outline-none focus:border-brand"
            />
            {linkError && <p className="mt-1 text-[12px] text-coral">{linkError}</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1.5 block text-[13px] text-gray">가격</label>
            <div className="flex h-11 items-center rounded-lg border border-black/15 px-3 focus-within:border-brand">
              <input
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="0"
                className="w-full text-[15px] outline-none"
              />
              <span className="text-[13px] text-gray">원</span>
            </div>
          </div>

          <div className="col-span-2">
            <label className="mb-1.5 block text-[13px] text-gray">이미지</label>
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="미리보기" className="h-20 w-20 object-cover" />
                ) : (
                  <span className="text-[11px] text-gray">미리보기</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                  onClick={() => fileInputRef.current?.click()}
                >
                  이미지 첨부
                </Button>
                <input
                  value={imageUrl && !imageUrl.startsWith("data:") ? imageUrl : ""}
                  onChange={(e) => setImageUrl(e.target.value || null)}
                  placeholder="또는 이미지 링크 붙여넣기"
                  className="h-9 w-full rounded-lg border border-black/15 px-3 text-[13px] outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[13px] text-gray">비고</label>
              <span className="text-[12px] text-gray">
                {memo.length}/{MEMO_MAX}
              </span>
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value.slice(0, MEMO_MAX))}
              rows={2}
              placeholder="메모를 남겨보세요"
              className="w-full resize-none rounded-lg border border-black/15 p-3 text-[15px] outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-medium text-ink">태그</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                selected={selectedTagIds.includes(tag.id)}
                color={tag.color}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Chip>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
              placeholder="+ 새 태그 만들기 (Enter)"
              className="h-9 w-full max-w-[220px] rounded-full border border-dashed border-black/20 px-3 text-[13px] outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-[14px] font-medium text-ink">우선순위 선택</label>
          <ScoreSelector
            label="필요도"
            hint="이게 없으면 지금 생활에 불편함이 있나요?"
            value={needScore}
            onChange={setNeedScore}
          />
          <ScoreSelector
            label="욕구/만족도"
            hint="이걸 가지면 얼마나 기쁠 것 같나요?"
            value={wantScore}
            onChange={setWantScore}
          />
          <div className="mt-6">
            <PriorityMatrixPreview needScore={needScore} wantScore={wantScore} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          저장하기
        </Button>
      </div>
    </Modal>
  );
}

function ScoreSelector({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="text-[12px] text-gray">{hint}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-5 gap-1.5">
        {SCORE_LABELS.map((scoreLabel, i) => {
          const scoreValue = i + 1;
          const active = value === scoreValue;
          return (
            <button
              key={scoreValue}
              type="button"
              onClick={() => onChange(scoreValue)}
              className={`h-9 rounded-lg text-[13px] font-medium transition-colors ${
                active ? "bg-brand text-white" : "bg-black/5 text-gray"
              }`}
            >
              {scoreLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
