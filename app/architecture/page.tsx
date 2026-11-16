import type { Metadata } from "next";
import Link from "next/link";
import { slides } from "./slides";
import s from "./_deck/deck.module.css";

export const metadata: Metadata = {
  title: "Architecture: Universal Editor on AEM headless · WKND Bank",
  description: "Slides on how WKND Bank's Next.js site is wired to AEM Content Fragments and Universal Editor.",
};

export default function ArchitectureOverview() {
  return (
    <main id="main" className={s.overview}>
      <div className="wrap">
        <h1>Universal Editor on AEM headless</h1>
        <p>{slides.length} slides on the architecture and the React implementation behind WKND Bank.</p>
        <ol className={s.grid}>
          {slides.map((slide, i) => (
            <li key={slide.title}>
              <Link href={`/architecture/${i + 1}`}>
                <span className={s.n}>
                  {i + 1} / {slides.length}
                </span>
                <span className={s.t}>{slide.title}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className={s.hint}>
          Present with <kbd>→</kbd> <kbd>←</kbd> or <kbd>Space</kbd>, <kbd>F</kbd> for full screen and <kbd>Esc</kbd> to come back here.
        </p>
      </div>
    </main>
  );
}
