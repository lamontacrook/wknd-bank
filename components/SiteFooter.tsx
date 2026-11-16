import Link from "next/link";
import type { Screen } from "@/lib/types";
import { aueContainer, aueFragment, aueProp } from "@/lib/aue";
import { UeOverlayToggle } from "./UeOverlayToggle";
import styles from "./SiteFooter.module.css";

const COLUMNS = [
  { title: "Bank", links: ["Checking", "Savings", "Credit cards", "Home loans"] },
  { title: "Support", links: ["Help & support", "Find a branch", "Security center"] },
  { title: "Company", links: ["About", "Careers", "Privacy"] },
];

// The footer's disclosures belong to the Screen fragment, so the container is scoped to it.
export function SiteFooter({ screen }: { screen: Screen }) {
  return (
    <footer id="disclosures" className={styles.footer}>
      <div className="wrap">
        <div className={styles.cols}>
          <div>
            <Link className={styles.wordmark} href="/">WKND Bank</Link>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div {...aueFragment(screen, { label: "Screen", type: "component" })}>
          <div className={styles.legal} {...aueContainer("disclosures", { label: "Disclosures", filter: "screen-disclosures" })}>
            {(screen.disclosures ?? []).map((d) => (
              <div key={d._path} {...aueFragment(d, { label: d.title })}>
                <h3 className="sr-only" {...aueProp("title", "text", "Title")}>{d.title}</h3>
                {d.body?.html && (
                  <div className="rich" {...aueProp("body", "richtext", "Body")} dangerouslySetInnerHTML={{ __html: d.body.html }} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.demo}>
          <Link className={styles.demoLink} href="/architecture">
            Architecture slides
          </Link>
          <UeOverlayToggle />
        </div>
      </div>
    </footer>
  );
}
