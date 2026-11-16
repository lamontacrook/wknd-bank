"use client";

import { useSyncExternalStore } from "react";
import { editorStore, overlayStore, writeOverlay } from "@/lib/editor";
import styles from "./UeOverlay.module.css";

// Demo control in the footer. Hidden inside Universal Editor, which has its own overlays.
export function UeOverlayToggle() {
  const editing = useSyncExternalStore(editorStore.subscribe, editorStore.get, editorStore.server);
  const on = useSyncExternalStore(overlayStore.subscribe, overlayStore.get, overlayStore.server);
  if (editing) return null;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={styles.toggle}
      onClick={() => writeOverlay(!on)}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      Show Universal Editor data
    </button>
  );
}
