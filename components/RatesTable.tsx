import type { RatesTable as RatesTableContent } from "@/lib/types";
import { aueContainer, aueFragment, aueProp } from "@/lib/aue";
import { RateFigure } from "./RateFigure";
import styles from "./RatesTable.module.css";

export function RatesTable({ content }: { content: RatesTableContent }) {
  const rates = content.rates ?? [];
  return (
    <section id="rates" className={styles.section} {...aueFragment(content)}>
      <div className="wrap">
        <div className={styles.head}>
          <h2 {...aueProp("title", "text", "Title")}>{content.title}</h2>
          {content.linkText && (
            <a className="link" href={content.linkUrl || "#"} {...aueProp("linkText", "text", "Link text")}>
              {content.linkText}
            </a>
          )}
        </div>
        <table className={styles.rates}>
          <thead>
            <tr>
              <th scope="col">Account</th>
              <th scope="col">Rate</th>
              <th scope="col">Term</th>
              <th scope="col">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody {...aueContainer("rates", { label: "Rates", filter: "rates-table-rates" })}>
            {rates.map((rate) => (
              <tr key={rate._path} {...aueFragment(rate, { model: "rate", label: rate.product })}>
                <td>
                  <strong {...aueProp("product", "text", "Product")}>{rate.product}</strong>
                </td>
                <td className={styles.num}>
                  <RateFigure rate={rate} showDate />
                </td>
                <td {...aueProp("term", "text", "Term")}>{rate.term}</td>
                <td>
                  {rate.ctaText && (
                    <a className="link" href={rate.ctaLink || "#"} {...aueProp("ctaText", "text", "CTA")}>
                      {rate.ctaText}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
