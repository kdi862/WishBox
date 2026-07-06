"use client";

import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "삭제",
  onCancel,
  onConfirm,
  zIndexClassName,
}: {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  zIndexClassName?: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} widthClassName="max-w-sm" zIndexClassName={zIndexClassName}>
      <p className="text-[16px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-2 text-[13px] leading-relaxed text-gray">{description}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
