"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Presenter keys: ←/→, PageUp/PageDown, Space, Home/End, Esc for the overview, F for full screen. */
export function DeckKeys({ index, total }: { index: number; total: number }) {
  const router = useRouter();

  useEffect(() => {
    const go = (n: number) => {
      if (n >= 1 && n <= total && n !== current()) router.push(`/architecture/${n}`);
    };
    // A fast second key press can land before the next slide mounts, so trust the URL over props.
    const current = () => Number(/\/architecture\/(\d+)/.exec(location.pathname)?.[1] ?? index);
    if (index < total) router.prefetch(`/architecture/${index + 1}`);

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go(e.shiftKey && e.key === " " ? current() - 1 : current() + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          go(current() - 1);
          break;
        case "Home":
          go(1);
          break;
        case "End":
          go(total);
          break;
        case "Escape":
          if (!document.fullscreenElement) router.push("/architecture");
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
  }, [index, total, router]);

  return null;
}
