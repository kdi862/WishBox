"use client";

import { ChevronDownIcon } from "./icons";

export type TabKey = "buy" | "bought";
export type SortOption = "priority" | "recent" | "price_asc" | "price_desc";

const SORT_LABEL: Record<SortOption, string> = {
  priority: "우선순위순",
  recent: "최근 추가순",
  price_asc: "가격 낮은순",
  price_desc: "가격 높은순",
};

export function TabsAndSort({
  activeTab,
  onTabChange,
  sortOption,
  onSortChange,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 px-4 sm:px-6">
      <div className="flex gap-5">
        <TabButton label="살 것" active={activeTab === "buy"} onClick={() => onTabChange("buy")} />
        <TabButton label="산 것" active={activeTab === "bought"} onClick={() => onTabChange("bought")} />
      </div>
      <div className="relative py-2">
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none rounded-md bg-transparent py-1.5 pl-2 pr-6 text-[13px] font-medium text-gray"
        >
          {(Object.keys(SORT_LABEL) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABEL[key]}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-gray" />
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative py-3 text-[15px] font-semibold transition-colors ${
        active ? "text-brand" : "text-gray"
      }`}
    >
      {label}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />}
    </button>
  );
}
