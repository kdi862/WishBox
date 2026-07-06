export function formatPrice(price: number | null): string {
  if (price === null) return "가격 미정";
  return `${price.toLocaleString("ko-KR")}원`;
}

export function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const TAG_PALETTE = [
  "#3555D8",
  "#FF6452",
  "#4C9A6A",
  "#B8860B",
  "#8A5CF6",
  "#DB4E9C",
  "#3596B5",
  "#E08E45",
];

export function nextTagColor(existingCount: number): string {
  return TAG_PALETTE[existingCount % TAG_PALETTE.length];
}
