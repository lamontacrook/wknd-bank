import "server-only";
import { cacheLife } from "next/cache";
import { AEM_HOST, HOME_PATH, fetchScreen, mockScreen, type Source } from "./aem";
import type { Screen } from "./types";

// Published content, cached for a few minutes. Falls back to the mock so the demo always renders.
export async function loadScreen(path = HOME_PATH): Promise<{ screen: Screen; source: Source }> {
  "use cache";
  cacheLife("minutes");
  if (!AEM_HOST) return { screen: mockScreen, source: "mock" };
  try {
    return { screen: await fetchScreen(AEM_HOST, { path }), source: "aem" };
  } catch (err) {
    console.warn("[aem] falling back to mock:", (err as Error).message);
    return { screen: mockScreen, source: "mock" };
  }
}
