"use client";

import { PlusIcon } from "./icons";
import { Button } from "./ui/Button";

export function Header({ onAddClick }: { onAddClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-paper/90 px-4 py-3 backdrop-blur sm:px-6">
      <h1 className="text-[22px] font-bold text-ink">WishBox</h1>
      <Button variant="primary" size="sm" onClick={onAddClick}>
        <PlusIcon className="size-4" />
        새 항목
      </Button>
    </header>
  );
}
