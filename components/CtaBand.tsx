import type { CtaBand as CtaBandContent } from "@/lib/types";
import { aueFragment, aueProp } from "@/lib/aue";
import styles from "./CtaBand.module.css";

// "spruce" is the legacy enum key in AEM; it renders the current primary brand color (harbor).
export function CtaBand({ content }: { content: CtaBandContent }) {
  const tone = content.tone === "ink" ? styles.ink : styles.brand;
  return (
    <section className={`${styles.cta} ${tone}`} {...aueFragment(content, { model: "cta-band" })}>
      <div className={`wrap ${styles.inner}`}>
        <h2 {...aueProp("headline", "text", "Headline")}>{content.headline}</h2>
        {content.ctaText && (
          <a className="btn btn-accent" href={content.ctaLink || "#"} {...aueProp("ctaText", "text", "CTA")}>
            {content.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
