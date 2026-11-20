"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Keys on a model detail slide: ←/→ step through models, Esc goes back to the model graph, F for full screen. */
export function ModelKeys({ prev, next, back }: { prev?: string; next?: string; back: string }) {
  const router = useRouter();

  useEffect(() => {
    if (next) router.prefetch(next);
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable]")) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          if (next) router.push(next);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          if (prev) router.push(prev);
          break;
        case "Escape":
          if (!document.fullscreenElement) router.push(back);
          break;
        case "f":
        case "F":
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen?.().catch(() => {});
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [prev, next, back, router]);

  return null;
}
