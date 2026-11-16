import type { ReactNode } from "react";
import styles from "./deck.module.css";

type Lang = "tsx" | "json" | "graphql" | "html" | "css";

const KEYWORDS = /^(import|export|from|const|let|function|return|async|await|if|type|query|use cache|true|false)$/;
const TOKEN: Record<Lang, RegExp> = {
  tsx: /(\/\/.*$|\{\/\*.*?\*\/\}|"(?:[^"\\]|\\.)*"|`[^`]*`|data-aue-[\w-]+|\baue[A-Z]\w*|\b(?:import|export|from|const|let|function|return|async|await|if|type)\b)/g,
  json: /("(?:[^"\\]|\\.)*"(?=\s*:)|"(?:[^"\\]|\\.)*"|\b(?:true|false)\b)/g,
  graphql: /(#.*$|"(?:[^"\\]|\\.)*"|\b(?:query|on)\b|\b_(?:path|variation|model)\b)/g,
  css: /(\/\*.*?\*\/|@media|\.[a-z][\w-]*)/g,
  html: /(<!--.*?-->|"(?:[^"\\]|\\.)*"|data-aue-[\w-]+|urn:adobe:aue:[\w:]+)/g,
};

function classify(tok: string, lang: Lang) {
  if (lang === "css") return tok.startsWith("/*") ? styles.tkC : tok.startsWith("@") ? styles.tkK : styles.tkA;
  if (tok.startsWith("//") || tok.startsWith("{/*") || tok.startsWith("<!--") || (lang === "graphql" && tok.startsWith("#"))) return styles.tkC;
  if (tok.startsWith("data-aue") || tok.startsWith("urn:adobe") || /^aue[A-Z]/.test(tok) || (lang === "graphql" && tok.startsWith("_"))) return styles.tkA;
  if (lang === "json" && tok.startsWith('"')) return undefined;
  if (tok.startsWith('"') || tok.startsWith("`")) return styles.tkS;
  if (KEYWORDS.test(tok) || tok === "on") return styles.tkK;
  return undefined;
}

function highlight(line: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN[lang])) {
    const i = m.index ?? 0;
    if (i > last) out.push(line.slice(last, i));
    // JSON keys stay plain; values get the string colour.
    const isJsonKey = lang === "json" && /"\s*$/.test(m[0]) && /^\s*:/.test(line.slice(i + m[0].length));
    const cls = isJsonKey ? styles.tkK : classify(m[0], lang);
    out.push(cls ? <span key={i} className={cls}>{m[0]}</span> : m[0]);
    last = i + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** A captioned code panel. `hl` lists 1-based line numbers to emphasise. */
export function Code({ code, lang = "tsx", caption, hl = [] }: { code: string; lang?: Lang; caption?: string; hl?: number[] }) {
  const lines = code.replace(/^(?:[ \t]*\n)+|\s+$/g, "").split("\n");
  return (
    <figure className={styles.code}>
      {caption && <figcaption>{caption}</figcaption>}
      <pre>
        <code>
          {lines.map((line, i) => (
            <span key={i} className={styles.line} data-hl={hl.includes(i + 1) || undefined}>
              {highlight(line, lang) /* empty lines still need a line box */}
              {line === "" && "\u00a0"}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
