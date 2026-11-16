// Client-only helpers for the Universal Editor context and the demo "show UE data" overlay.

// UE loads the app in an iframe; `?aue` forces editor mode for local debugging.
export function inEditor() {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top || new URLSearchParams(window.location.search).has("aue");
  } catch {
    return true;
  }
}

// Demo only: the footer toggle stores this flag in sessionStorage; UeOverlay draws boxes while it is "1".
export const UE_OVERLAY_KEY = "wknd-bank:ue-overlay";
const CHANGE = "wknd-bank:ue-overlay-change";

export function readOverlay() {
  try {
    return window.sessionStorage.getItem(UE_OVERLAY_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeOverlay(on: boolean) {
  try {
    if (on) window.sessionStorage.setItem(UE_OVERLAY_KEY, "1");
    else window.sessionStorage.removeItem(UE_OVERLAY_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE));
}

export function subscribeOverlay(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noop = () => () => {};
export const editorStore = { subscribe: noop, get: inEditor, server: () => false };
export const overlayStore = { subscribe: subscribeOverlay, get: readOverlay, server: () => false };
