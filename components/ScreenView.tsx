"use client";

import { useEffect, useState } from "react";
import { AEM_AUTHOR, fetchScreen, type Source } from "@/lib/aem";
import { aueContainer, aueFragment } from "@/lib/aue";
import { inEditor } from "@/lib/editor";
import type { Screen } from "@/lib/types";
import { ModelManager } from "./ModelManager";
import { SiteFooter } from "./SiteFooter";
import styles from "./ScreenView.module.css";

type ViewSource = Source | "author";

// Universal Editor loads the page in an iframe; there we re-read the screen from author with the
// editor's IMS session so drafts and edits show up. Outside UE, the server-rendered data stays.

export function ScreenView({ initial, source: initialSource }: { initial: Screen; source: Source }) {
  const [screen, setScreen] = useState(initial);
  const [source, setSource] = useState<ViewSource>(initialSource);

  useEffect(() => {
    if (!AEM_AUTHOR || !inEditor()) return;
    let cancelled = false;
    fetchScreen(AEM_AUTHOR, { path: initial._path, init: { credentials: "include", cache: "no-store" } })
      .then((s) => {
        if (!cancelled) {
          setScreen(s);
          setSource("author");
        }
      })
      .catch((err) => console.warn("[aem] author fetch failed, keeping current content:", err.message));
    return () => {
      cancelled = true;
    };
  }, [initial._path]);

  return (
    <>
      <main
        id="main"
        {...aueFragment(screen, { label: "Screen", type: "container" })}
        {...aueContainer("block", { label: "Sections", filter: "screen-block" })}
      >
        {(screen.block ?? []).map((block) => (
          <ModelManager key={block._path} content={block} />
        ))}
      </main>
      <SiteFooter screen={screen} />
      <p className={styles.badge} data-source={source} role="status">
        {source === "mock" ? "Sample content" : source === "author" ? "AEM author" : "AEM connected"}
      </p>
    </>
  );
}
