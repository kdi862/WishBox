import * as cheerio from "cheerio";
import { NextResponse, type NextRequest } from "next/server";
import { LinkPreviewError, assertPublicHttpUrl } from "@/lib/urlSafety";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;

async function fetchHtml(initialUrl: string): Promise<{ html: string; finalUrl: string }> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicHttpUrl(currentUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new LinkPreviewError("페이지를 가져오는 데 시간이 너무 오래 걸려요.");
      }
      throw new LinkPreviewError("페이지에 연결할 수 없어요.");
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new LinkPreviewError("리다이렉트 대상을 찾을 수 없어요.");
      currentUrl = new URL(location, url).toString();
      continue;
    }

    if (!response.ok) {
      throw new LinkPreviewError(`페이지를 가져오지 못했어요. (${response.status})`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("xhtml")) {
      throw new LinkPreviewError("HTML 페이지가 아니에요.");
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BYTES) {
      throw new LinkPreviewError("페이지 용량이 너무 커요.");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new LinkPreviewError("응답을 읽을 수 없어요.");

    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        await reader.cancel();
        throw new LinkPreviewError("페이지 용량이 너무 커요.");
      }
      chunks.push(value);
    }

    const html = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf-8");
    return { html, finalUrl: url.toString() };
  }

  throw new LinkPreviewError("리다이렉트가 너무 많아요.");
}

function extractJsonLdPrice($: ReturnType<typeof cheerio.load>): number | null {
  let price: number | null = null;

  $('script[type="application/ld+json"]').each((_, el) => {
    if (price !== null) return;
    try {
      const raw = $(el).contents().text();
      const data = JSON.parse(raw);
      const roots = Array.isArray(data) ? data : [data];

      for (const root of roots) {
        const nodes = Array.isArray(root?.["@graph"]) ? root["@graph"] : [root];
        for (const node of nodes) {
          const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
          if (!types.includes("Product")) continue;

          const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
          const rawPrice = offers?.price ?? offers?.priceSpecification?.price;
          const parsed =
            typeof rawPrice === "string" ? Number.parseFloat(rawPrice.replace(/[^0-9.]/g, "")) : rawPrice;

          if (typeof parsed === "number" && !Number.isNaN(parsed)) {
            price = Math.round(parsed);
          }
        }
      }
    } catch {
      // malformed JSON-LD block; skip it
    }
  });

  return price;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "url이 필요해요." }, { status: 400 });
  }

  try {
    const { html, finalUrl } = await fetchHtml(rawUrl);
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr("content");
    const title = ogTitle?.trim() || $("title").first().text().trim() || null;

    const ogImage = $('meta[property="og:image"]').attr("content");
    const image = ogImage ? new URL(ogImage, finalUrl).toString() : null;

    const price = extractJsonLdPrice($);

    return NextResponse.json({ title: title || null, image, price });
  } catch (error) {
    const message = error instanceof LinkPreviewError ? error.message : "정보를 가져오지 못했어요.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
