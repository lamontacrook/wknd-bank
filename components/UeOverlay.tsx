"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { editorStore, overlayStore, writeOverlay } from "@/lib/editor";
import styles from "./UeOverlay.module.css";

// Demo only: outlines every data-aue-* element so an audience can see what Universal Editor reads.
// Never rendered inside UE (it draws its own overlays there).

type Kind = "fragment" | "container" | "text" | "richtext" | "media";

type Box = {
  key: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  flush: boolean;
  label: string;
  detail: string;
  title: string;
};

const KINDS: { kind: Kind; name: string; hint: string }[] = [
  { kind: "fragment", name: "Fragment", hint: "data-aue-resource" },
  { kind: "container", name: "Container", hint: "data-aue-type=container" },
  { kind: "text", name: "Text", hint: "data-aue-prop" },
  { kind: "richtext", name: "Rich text", hint: "data-aue-prop" },
  { kind: "media", name: "Media", hint: "data-aue-prop" },
];

const SELECTOR = "[data-aue-resource],[data-aue-prop]";

function kindOf(el: Element): Kind {
  const type = el.getAttribute("data-aue-type");
  if (type === "container") return "container";
  if (el.hasAttribute("data-aue-resource")) return "fragment";
  if (type === "richtext" || type === "media") return type;
  return "text";
}

// urn:aemconnection:/content/dam/.../home/hero/jcr:content/data/master -> home/hero
function fragmentName(urn: string) {
  const path = urn.replace(/^urn:[^:]+:/, "").replace(/\/jcr:content\/data\/.*$/, "");
  return path.split("/").slice(-2).join("/");
}

function describe(el: Element, kind: Kind) {
  const a = (n: string) => el.getAttribute(`data-aue-${n}`) || "";
  const label = a("label") || a("prop") || "Fragment";
  if (kind === "container") return { label, detail: [a("prop"), a("filter") && `filter: ${a("filter")}`].filter(Boolean).join(" · ") };
  if (kind === "fragment") return { label, detail: [fragmentName(a("resource")), a("model")].filter(Boolean).join(" · ") };
  return { label: a("prop"), detail: kind };
}

function measure(own: HTMLElement | null): Box[] {
  const boxes: Box[] = [];
  document.querySelectorAll(SELECTOR).forEach((el, i) => {
    if (own?.contains(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const kind = kindOf(el);
    let depth = 0;
    for (let p = el.parentElement?.closest(SELECTOR); p; p = p.parentElement?.closest(SELECTOR)) depth++;
    // A box that starts at its parent's top edge would put its tag on top of the parent's tag.
    const parent = el.parentElement?.closest(SELECTOR);
    const flush = !!parent && Math.abs(parent.getBoundingClientRect().top - r.top) < 20;
    const title = Array.from(el.attributes)
      .filter((at) => at.name.startsWith("data-aue-"))
      .map((at) => `${at.name}="${at.value}"`)
      .join("\n");
    boxes.push({ key: `${i}`, kind, x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height, depth, flush, title, ...describe(el, kind) });
  });
  return boxes;
}

export function UeOverlay() {
  const editing = useSyncExternalStore(editorStore.subscribe, editorStore.get, editorStore.server);
  const on = useSyncExternalStore(overlayStore.subscribe, overlayStore.get, overlayStore.server);
  const active = on && !editing;
  const root = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setBoxes(measure(root.current)));
    };
    schedule();

    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    const mutate = new MutationObserver((records) => {
      if (records.some((r) => !root.current?.contains(r.target))) schedule();
    });
    mutate.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    document.fonts?.ready.then(schedule);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutate.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    };
  }, [active]);

  if (!active) return null;

  const counts = boxes.reduce<Record<string, number>>((acc, b) => ({ ...acc, [b.kind]: (acc[b.kind] ?? 0) + 1 }), {});

  return (
    <div ref={root} className={styles.root}>
      <div className={styles.layer} aria-hidden="true">
        {boxes.map((b) => (
          <div
            key={b.key}
            className={styles.box}
            data-kind={b.kind}
            data-flush={b.flush || undefined}
            style={{ left: b.x, top: b.y, width: b.w, height: b.h, zIndex: 1 + b.depth }}
          >
            <span className={styles.tag} title={b.title}>
              <strong>{b.label}</strong>
              {b.detail && <span>{b.detail}</span>}
            </span>
          </div>
        ))}
      </div>
      <aside className={styles.legend} aria-label="Universal Editor data legend">
        <header>
          <p>Universal Editor data</p>
          <button type="button" onClick={() => writeOverlay(false)} aria-label="Hide Universal Editor data">
            ×
          </button>
        </header>
        <ul>
          {KINDS.map(({ kind, name, hint }) => (
            <li key={kind} data-kind={kind}>
              <span className={styles.swatch} aria-hidden="true" />
              <span>{name}</span>
              <code>{hint}</code>
              <span className={styles.count}>{counts[kind] ?? 0}</span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>Hover a tag for its attributes. Demo view only; hidden in Universal Editor.</p>
      </aside>
    </div>
  );
}
