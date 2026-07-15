import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export class LinkPreviewError extends Error {}

const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1"]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  const [a, b] = parts;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("::ffff:")) {
    return isPrivateIPv4(normalized.slice("::ffff:".length));
  }
  return false;
}

function isPrivateIP(ip: string): boolean {
  return isIP(ip) === 4 ? isPrivateIPv4(ip) : isPrivateIPv6(ip);
}

/**
 * Validates that a URL is http(s) and does not resolve to a private/internal
 * address, to prevent SSRF when fetching a user-supplied link server-side.
 */
export async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new LinkPreviewError("올바른 URL이 아니에요.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new LinkPreviewError("http/https 링크만 지원해요.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) {
    throw new LinkPreviewError("접근할 수 없는 주소예요.");
  }

  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) throw new LinkPreviewError("접근할 수 없는 주소예요.");
    return url;
  }

  let results;
  try {
    results = await lookup(hostname, { all: true });
  } catch {
    throw new LinkPreviewError("주소를 찾을 수 없어요.");
  }
  if (results.length === 0) {
    throw new LinkPreviewError("주소를 찾을 수 없어요.");
  }
  for (const { address } of results) {
    if (isPrivateIP(address)) throw new LinkPreviewError("접근할 수 없는 주소예요.");
  }

  return url;
}
