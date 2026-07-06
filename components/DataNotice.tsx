"use client";

import { XIcon } from "./icons";

export function DataNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 sm:mx-6">
      <p className="flex-1 text-[13px] leading-relaxed text-ink">
        이 목록은 이 브라우저에만 저장돼요. 데이터를 지우면 사라질 수 있어요.
      </p>
      <button type="button" onClick={onDismiss} aria-label="안내 닫기" className="mt-0.5 text-gray">
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
