import type { WishItem } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export function SummaryBanner({ items }: { items: WishItem[] }) {
  const unpurchased = items.filter((item) => !item.is_purchased);
  const total = unpurchased.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const hasAnyPrice = unpurchased.some((item) => item.price !== null);

  return (
    <div className="mx-4 mt-3 rounded-xl bg-brand/8 px-4 py-3 sm:mx-6">
      <p className="text-[14px] text-ink">
        사고 싶은 것 총 <span className="font-bold text-brand">{unpurchased.length}개</span>
        {hasAnyPrice && (
          <>
            {" · "}합계 <span className="font-bold text-brand">{formatPrice(total)}</span>
          </>
        )}
      </p>
    </div>
  );
}
