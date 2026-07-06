"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

export function Modal({
  isOpen,
  onClose,
  children,
  widthClassName = "max-w-md",
  zIndexClassName = "z-50",
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
  zIndexClassName?: string;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 ${zIndexClassName} flex items-end justify-center bg-black/40 sm:items-center sm:p-4`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${widthClassName} max-h-[92vh] overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
