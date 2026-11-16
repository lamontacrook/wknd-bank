import type { CSSProperties } from "react";
import styles from "./deck.module.css";

const HARBOR = "#1d4a85";
const BRASS = "#a8740f";
const INK = "#0f1f36";
const MUTED = "#4a5669";
const FOG = "#b8c8de";

function Arrow({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill={color} />
    </marker>
  );
}

function Label({ x, y, children, color = INK, anchor = "start" }: { x: number; y: number; children: string; color?: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fill={color} fontSize="16" fontWeight="600" textAnchor={anchor} stroke="#faf8f3" strokeWidth="6" paintOrder="stroke" strokeLinejoin="round">
      {children}
    </text>
  );
}

/** System overview: who reads from where, and where edits go. */
export function ArchitectureDiagram() {
  return (
    <svg className={styles.diagram} viewBox="0 0 1400 560" role="img" aria-labelledby="arch-t arch-d">
      <title id="arch-t">Universal Editor and AEM headless architecture</title>
      <desc id="arch-d">
        The Next.js app reads published fragments from AEM publish for visitors. Inside Universal Editor the same app runs in an
        iframe, re-reads from AEM author with the editor&apos;s session, and edits are written to author by the Universal Editor service.
        Author publishes to the publish tier.
      </desc>
      <defs>
        <Arrow id="a-harbor" color={HARBOR} />
        <Arrow id="a-brass" color={BRASS} />
        <Arrow id="a-ink" color={INK} />
      </defs>

      {/* Universal Editor with the app framed inside it */}
      <rect x="20" y="10" width="640" height="320" rx="14" fill="#ebf0f6" stroke={INK} strokeWidth="2" />
      <text x="46" y="50" fontSize="25" fontWeight="700" fill={INK}>Universal Editor</text>
      <text x="46" y="76" fontSize="17" fill={MUTED}>experience.adobe.com · properties rail, content tree, preview</text>
      <rect x="46" y="100" width="588" height="206" rx="10" fill="#faf8f3" stroke={HARBOR} strokeWidth="2" strokeDasharray="8 6" />
      <text x="70" y="136" fontSize="20" fontWeight="700" fill={INK}>Your Next.js app, framed</text>
      <text x="70" y="168" fontSize="17" fill={INK}>cors.js connects the page to the editor</text>
      <text x="70" y="196" fontSize="17" fill={INK}>&lt;meta urn:adobe:aue:system:aemconnection&gt; → author</text>
      <text x="70" y="224" fontSize="17" fill={INK}>data-aue-* attributes on every editable element</text>
      <text x="70" y="252" fontSize="17" fill={INK}>component definition, models, filters (3 JSON files)</text>
      <text x="70" y="280" fontSize="17" fill={INK}>inEditor() → re-read the screen from author</text>

      {/* AEM author */}
      <rect x="840" y="10" width="540" height="320" rx="14" fill="#102a4c" />
      <text x="866" y="50" fontSize="25" fontWeight="700" fill="#faf8f3">AEM author</text>
      <text x="866" y="76" fontSize="17" fill={FOG}>Where content is written and modelled</text>
      {[
        ["Content Fragment models", "/conf/wknd-bank/…/cfm/models"],
        ["Content Fragments", "/content/dam/wknd-bank/site/en"],
        ["Persisted GraphQL query", "wknd-bank/screen-by-path"],
        ["Login session (IMS)", "login-token cookie, Partitioned"],
      ].map(([a, b], i) => (
        <g key={a} transform={`translate(866 ${116 + i * 52})`}>
          <rect x="0" y="0" width="488" height="42" rx="8" fill="rgb(250 248 243 / 0.08)" />
          <text x="16" y="27" fontSize="17" fontWeight="600" fill="#faf8f3">{a}</text>
          <text x="472" y="27" fontSize="15" fill={FOG} textAnchor="end">{b}</text>
        </g>
      ))}

      {/* Bottom row */}
      <rect x="20" y="410" width="300" height="140" rx="14" fill="#faf8f3" stroke={INK} strokeWidth="2" />
      <text x="44" y="448" fontSize="21" fontWeight="700" fill={INK}>Visitor&apos;s browser</text>
      <text x="44" y="478" fontSize="16" fill={MUTED}>Gets server-rendered HTML</text>
      <text x="44" y="502" fontSize="16" fill={MUTED}>data-aue-* is inert here</text>

      <rect x="400" y="410" width="360" height="140" rx="14" fill="#faf8f3" stroke={HARBOR} strokeWidth="2.5" />
      <text x="424" y="448" fontSize="21" fontWeight="700" fill={INK}>Next.js server</text>
      <text x="424" y="478" fontSize="16" fill={MUTED}>loadScreen() · &quot;use cache&quot; (minutes)</text>
      <text x="424" y="502" fontSize="16" fill={MUTED}>ModelManager picks components</text>
      <text x="424" y="526" fontSize="16" fill={MUTED}>Falls back to mock JSON</text>

      <rect x="840" y="410" width="540" height="140" rx="14" fill="#faf8f3" stroke={INK} strokeWidth="2" />
      <text x="866" y="448" fontSize="21" fontWeight="700" fill={INK}>AEM publish + CDN</text>
      <text x="866" y="478" fontSize="16" fill={MUTED}>Persisted query as a cacheable GET</text>
      <text x="866" y="506" fontSize="15" fill={INK} fontFamily="ui-monospace, Menlo, monospace">
        /graphql/execute.json/wknd-bank/screen-by-path
      </text>

      {/* Visitor path */}
      <line x1="760" y1="480" x2="836" y2="480" stroke={HARBOR} strokeWidth="3" markerEnd="url(#a-harbor)" />
      <Label x={798} y={466} color={HARBOR} anchor="middle">GET</Label>
      <line x1="398" y1="480" x2="324" y2="480" stroke={HARBOR} strokeWidth="3" markerEnd="url(#a-harbor)" />
      <Label x={360} y={466} color={HARBOR} anchor="middle">HTML</Label>
      <line x1="580" y1="408" x2="580" y2="310" stroke={HARBOR} strokeWidth="3" markerEnd="url(#a-harbor)" />
      <Label x={594} y={372} color={HARBOR}>same URL, framed</Label>

      {/* Editor read + write */}
      <line x1="636" y1="250" x2="836" y2="250" stroke={BRASS} strokeWidth="3" markerEnd="url(#a-brass)" />
      <Label x={738} y={238} color={BRASS} anchor="middle">GET + credentials</Label>
      <line x1="662" y1="56" x2="836" y2="56" stroke={INK} strokeWidth="3" strokeDasharray="9 7" markerEnd="url(#a-ink)" />
      <Label x={750} y={44} anchor="middle">edits saved</Label>

      {/* Publish */}
      <line x1="1110" y1="332" x2="1110" y2="406" stroke={INK} strokeWidth="3" markerEnd="url(#a-ink)" />
      <Label x={1124} y={376}>publish (replicate)</Label>
    </svg>
  );
}

export function DiagramLegend() {
  return (
    <p className={styles.legend}>
      <span><i style={{ "--k": HARBOR } as CSSProperties} /> Visitor read: publish, cached</span>
      <span><i style={{ "--k": BRASS } as CSSProperties} /> Editor read: author, with the IMS session</span>
      <span><i data-dash style={{ "--k": INK } as CSSProperties} /> Editor write: Universal Editor → author</span>
    </p>
  );
}
