import type { BankHero as BankHeroContent } from "@/lib/types";
import { aueContainer, aueFragment, aueProp } from "@/lib/aue";
import { RateFigure } from "./RateFigure";
import styles from "./BankHero.module.css";

export function BankHero({ content }: { content: BankHeroContent }) {
  const rates = content.rates ?? [];
  const layout = content.layout === "stacked" ? styles.stacked : styles.split;
  return (
    <section className={`${styles.hero} ${layout}`} {...aueFragment(content, { model: "bank-hero" })}>
      <div className={`wrap ${styles.grid}`}>
        <div>
          <h1 {...aueProp("headline", "text", "Headline")}>{content.headline}</h1>
          {content.subHeadline && (
            <p className={styles.lede} {...aueProp("subHeadline", "text", "Sub-headline")}>
              {content.subHeadline}
            </p>
          )}
          <div className={styles.actions}>
            {content.primaryCtaText && (
              <a className="btn btn-primary" href={content.primaryCtaLink || "#"} {...aueProp("primaryCtaText", "text", "Primary CTA")}>
                {content.primaryCtaText}
              </a>
            )}
            {content.secondaryCtaText && (
              <a className="link" href={content.secondaryCtaLink || "#"} {...aueProp("secondaryCtaText", "text", "Secondary CTA")}>
                {content.secondaryCtaText}
              </a>
            )}
          </div>
        </div>
        {rates.length > 0 && (
          <aside className={styles.ledger} aria-labelledby="ledger-h">
            <h2 id="ledger-h" {...aueProp("ratesTitle", "text", "Ledger title")}>
              {content.ratesTitle || "Rates at a glance"}
            </h2>
            <dl {...aueContainer("rates", { label: "Rates", filter: "bank-hero-rates" })}>
              {rates.map((rate) => (
                <div key={rate._path} className={styles.row} {...aueFragment(rate, { model: "rate", label: rate.product })}>
                  <dt>
                    <span {...aueProp("product", "text", "Product")}>{rate.product}</span>
                    {rate.detail && <small {...aueProp("detail", "text", "Detail")}>{rate.detail}</small>}
                  </dt>
                  <dd>
                    <RateFigure rate={rate} />
                  </dd>
                </div>
              ))}
            </dl>
            {content.secondaryCtaLink && (
              <p className={styles.foot}>
                <a className="link" href={content.secondaryCtaLink}>
                  See all rates and disclosures
                </a>
              </p>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
