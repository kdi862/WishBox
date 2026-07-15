export interface LinkPreviewResult {
  title: string | null;
  image: string | null;
  price: number | null;
}

export async function fetchLinkPreview(url: string): Promise<LinkPreviewResult> {
  let response: Response;
  try {
    response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
  } catch {
    throw new Error("서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("정보를 가져오지 못했어요.");
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : "정보를 가져오지 못했어요.";
    throw new Error(errorMessage);
  }

  return data as LinkPreviewResult;
}
