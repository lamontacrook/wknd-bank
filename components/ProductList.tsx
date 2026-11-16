import type { ProductList as ProductListContent } from "@/lib/types";
import { aueContainer, aueFragment, aueProp } from "@/lib/aue";
import styles from "./ProductList.module.css";

export function ProductList({ content }: { content: ProductListContent }) {
  return (
    <section id={content.anchor || undefined} className={styles.section} {...aueFragment(content)}>
      <div className="wrap">
        <h2 className={styles.title} {...aueProp("title", "text", "Title")}>
          {content.title}
        </h2>
        <ul className={styles.list} {...aueContainer("items", { label: "Products", filter: "product-list-items" })}>
          {(content.items ?? []).map((item) => (
            <li key={item._path} className={styles.item} {...aueFragment(item, { label: item.name })}>
              <h3 {...aueProp("name", "text", "Name")}>{item.name}</h3>
              <p {...aueProp("summary", "text", "Summary")}>{item.summary}</p>
              {item.ctaText && (
                <a className="link" href={item.ctaLink || "#"} {...aueProp("ctaText", "text", "CTA")}>
                  {item.ctaText}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
