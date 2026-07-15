"use client";

import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

const HIGHLIGHTS = [
  {
    title: "카테고리로 분류하고 필터링",
    description: "항목마다 카테고리를 붙이고, 원하는 카테고리만 골라서 모아볼 수 있어요.",
  },
  {
    title: "필요도 × 욕구로 우선순위 확인",
    description: "필요한 정도와 갖고 싶은 정도를 함께 따져서, 뭘 먼저 사면 좋을지 알려드려요.",
  },
  {
    title: "이 브라우저에만 저장돼요",
    description: "로그인 없이 바로 쓸 수 있지만, 브라우저 데이터를 지우면 항목도 함께 사라질 수 있어요.",
  },
];

export function WelcomeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} widthClassName="max-w-sm">
      <h2 className="text-[20px] font-bold text-ink">WishBox에 오신 걸 환영해요</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-gray">
        여기저기서 생긴 &ldquo;사고 싶다&rdquo;는 마음을 한 곳에 모아두는 위시리스트예요.
      </p>

      <ul className="mt-5 flex flex-col gap-4">
        {HIGHLIGHTS.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            <div>
              <p className="text-[14px] font-semibold text-ink">{item.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-gray">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <Button variant="primary" className="mt-6 w-full" onClick={onClose}>
        시작하기
      </Button>
    </Modal>
  );
}
