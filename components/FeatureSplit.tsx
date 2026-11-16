import Image from "next/image";
import type { FeatureSplit as FeatureSplitContent } from "@/lib/types";
import { aueFragment, aueProp } from "@/lib/aue";
import styles from "./FeatureSplit.module.css";

function imageSrc(content: FeatureSplitContent) {
  const img = content.image;
  return img?._publishUrl || img?._authorUrl || "";
}

export function FeatureSplit({ content }: { content: FeatureSplitContent }) {
  const src = imageSrc(content);
  const classes = [
    styles.feature,
    content.background === "paper" ? styles.paper : styles.mist,
    content.mediaPosition === "left" ? styles.mediaLeft : "",
    content.mobileOrder === "media-first" ? styles.mediaFirst : "",
  ].join(" ");

  return (
    <section className={classes} {...aueFragment(content, { model: "feature-split" })}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.copy}>
          <h2 {...aueProp("headline", "text", "Headline")}>{content.headline}</h2>
          {content.body?.html && (
            <div className={`rich ${styles.body}`} {...aueProp("body", "richtext", "Body")} dangerouslySetInnerHTML={{ __html: content.body.html }} />
          )}
        </div>
        <div className={styles.media} {...aueProp("image", "media", "Image")}>
          {src ? (
            <Image src={src} alt={content.imageAlt || ""} width={600} height={600} className={styles.image} unoptimized />
          ) : (
            <PhoneIllustration />
          )}
        </div>
      </div>
    </section>
  );
}

// Fallback when the fragment has no image: the prototype's CSS phone, with no real figures.
function PhoneIllustration() {
  return (
    <div className={styles.phone} role="img" aria-label="Illustration of the WKND Bank app with a spending list and a card lock toggle">
      <div className={styles.screen}>
        <span>Everyday checking</span>
        <span className={`figure ${styles.balance}`}>$•,•••.••</span>
        {["Groceries", "Transit", "Utilities"].map((label) => (
          <div key={label} className={styles.phoneRow}>
            <span>{label}</span>
            <span>—</span>
          </div>
        ))}
        <div className={styles.lock}>
          <span>Card locked</span>
          <span className={styles.toggle} />
        </div>
      </div>
    </div>
  );
}
