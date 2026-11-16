import mock from "./mock/screen-home.json";
import type { Screen } from "./types";

export const AEM_PROJECT = process.env.NEXT_PUBLIC_AEM_PROJECT || "wknd-bank";
export const AEM_HOST = process.env.NEXT_PUBLIC_AEM_HOST || "";
export const AEM_AUTHOR = process.env.NEXT_PUBLIC_AEM_AUTHOR || "";
export const HOME_PATH = "/content/dam/wknd-bank/site/en/home/home";
export const QUERY = "screen-by-path";

export const mockScreen = mock as unknown as Screen;

export type Source = "aem" | "mock";

export function queryUrl(host: string, path = HOME_PATH, variation = "master") {
  const params = `;path=${encodeURIComponent(path)};variation=${encodeURIComponent(variation)}`;
  return `${host.replace(/\/$/, "")}/graphql/execute.json/${AEM_PROJECT}/${QUERY}${params}`;
}

// Persisted queries are plain GETs, so no client library is needed. On author, pass
// credentials: "include" so the Universal Editor session's IMS cookie is sent.
export async function fetchScreen(
  host: string,
  { path = HOME_PATH, init }: { path?: string; init?: RequestInit } = {},
): Promise<Screen> {
  const res = await fetch(queryUrl(host, path), { headers: { accept: "application/json" }, ...init });
  if (!res.ok) throw new Error(`AEM ${res.status} for ${QUERY}`);
  const json = await res.json();
  const item = json?.data?.screenByPath?.item;
  if (!item) throw new Error(json?.errors?.[0]?.message || "AEM returned no screen");
  return item as Screen;
}
