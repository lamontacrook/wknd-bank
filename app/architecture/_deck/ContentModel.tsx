import s from "./deck.module.css";

type Line = { text: string; enum?: boolean };

const ROW = 23;

function Markers() {
  return (
    <defs>
      {[
        ["cm-a", s.cmMarker],
        ["cm-a-ink", s.cmMarkerInk],
      ].map(([id, cls]) => (
        <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className={cls} />
        </marker>
      ))}
    </defs>
  );
}

function ModelBox({ x, y, w, title, lines, root }: { x: number; y: number; w: number; title: string; lines: Line[]; root?: boolean }) {
  const h = 46 + lines.length * ROW;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="10" className={root ? s.cmRoot : s.cmBox} />
      <text x="16" y="30" className={s.cmTitle}>
        {title}
      </text>
      {lines.map((line, i) => (
        <g key={line.text} transform={`translate(16 ${54 + i * ROW})`}>
          {line.enum && <rect x="0" y="-11" width="8" height="8" rx="2" className={s.cmEnumDot} />}
          <text x={line.enum ? 14 : 0} y="0" className={s.cmText}>
            {line.text}
          </text>
        </g>
      ))}
    </g>
  );
}

function Label({ x, y, children, anchor = "start" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={s.cmLabel}>
      {children}
    </text>
  );
}

/** The nine Content Fragment models and the reference fields that join them. */
export function ModelGraph() {
  const sections: { title: string; lines: Line[] }[] = [
    { title: "Bank Hero", lines: [{ text: "headline · subHeadline · ratesTitle" }, { text: "primary + secondary CTA" }, { text: "layout: split | stacked", enum: true }] },
    { title: "Rates Table", lines: [{ text: "title" }, { text: "linkText · linkUrl" }] },
    { title: "Product List", lines: [{ text: "title" }, { text: "anchor (pattern-checked)" }] },
    { title: "Feature Split", lines: [{ text: "headline · body · image · imageAlt" }, { text: "mediaPosition · mobileOrder", enum: true }, { text: "background: mist | paper", enum: true }] },
    { title: "Cta Band", lines: [{ text: "headline · ctaText · ctaLink" }, { text: "tone: spruce | ink", enum: true }] },
  ];
  const heights = sections.map((m) => 46 + m.lines.length * ROW);
  const tops = heights.map((_, i) => 10 + heights.slice(0, i).reduce((a, h) => a + h + 14, 0));
  const centers = tops.map((t, i) => t + heights[i] / 2);
  const screenH = 46 + 3 * ROW;
  const screenY = centers[2] - screenH / 2;

  return (
    <svg className={s.diagram} viewBox="0 0 1400 640" role="img" aria-labelledby="cm-t cm-d">
      <title id="cm-t">WKND Bank Content Fragment models</title>
      <desc id="cm-d">
        A Screen references five section models through its block field and Disclosure fragments through its disclosures field. Bank
        Hero and Rates Table reference Rate fragments. Product List references Product Line fragments. Each Rate references one
        Disclosure.
      </desc>
      <Markers />

      <ModelBox x={20} y={screenY} w={270} root title="Screen" lines={[{ text: "title" }, { text: "block → 5 section types" }, { text: "disclosures → Disclosure" }]} />

      {sections.map((m, i) => (
        <ModelBox key={m.title} x={400} y={tops[i]} w={350} title={m.title} lines={m.lines} />
      ))}

      <ModelBox
        x={860}
        y={40}
        w={300}
        title="Rate"
        lines={[
          { text: "product · detail · term" },
          { text: "rate (number)" },
          { text: "rateType: APY | APR", enum: true },
          { text: "effectiveDate (date)" },
          { text: "status: sample | approved", enum: true },
          { text: "ctaText · ctaLink" },
        ]}
      />
      <ModelBox x={860} y={centers[2] - (46 + 2 * ROW) / 2} w={300} title="Product Line" lines={[{ text: "name · summary" }, { text: "ctaText · ctaLink" }]} />
      <ModelBox x={1190} y={440} w={190} title="Disclosure" lines={[{ text: "title" }, { text: "body (multiline)" }]} />

      {/* Screen.block → sections */}
      <path d={`M290 ${centers[2]} H345`} className={s.cmEdge} />
      <path d={`M345 ${centers[0]} V${centers[4]}`} className={s.cmEdge} />
      {centers.map((c) => (
        <path key={c} d={`M345 ${c} H396`} className={s.cmEdge} markerEnd="url(#cm-a)" />
      ))}
      <Label x={300} y={centers[2] - 12}>block [ ]</Label>

      {/* Section references */}
      <path d={`M750 ${centers[0]} H800 V120 H856`} className={s.cmEdge} markerEnd="url(#cm-a)" />
      <path d={`M750 ${centers[1]} H800 V170 H856`} className={s.cmEdge} markerEnd="url(#cm-a)" />
      <Label x={808} y={110}>rates [ ]</Label>
      <Label x={808} y={194}>rates [ ]</Label>
      <path d={`M750 ${centers[2]} H856`} className={s.cmEdge} markerEnd="url(#cm-a)" />
      <Label x={803} y={centers[2] - 10} anchor="middle">items [ ]</Label>

      {/* Rate.disclosure → Disclosure */}
      <path d="M1160 160 H1285 V416" className={s.cmEdge} markerEnd="url(#cm-a)" />
      <Label x={1295} y={300}>disclosure</Label>

      {/* Screen.disclosures → Disclosure */}
      <path d={`M155 ${screenY + screenH} V620 H1285 V${440 + 46 + 2 * ROW + 4}`} className={s.cmEdgeDash} markerEnd="url(#cm-a-ink)" />
      <Label x={720} y={612} anchor="middle">disclosures [ ] (rendered in the footer)</Label>
    </svg>
  );
}

function Node({ x, y, w, h = 52, path, model, reused, root }: { x: number; y: number; w: number; h?: number; path: string; model: string; reused?: boolean; root?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="8" className={root ? s.cmRoot : reused ? s.cmReused : s.cmBox} />
      <text x="14" y="22" className={s.cmPath}>
        {path}
      </text>
      <text x="14" y="42" className={s.cmText}>
        {model}
      </text>
    </g>
  );
}

const curve = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} C${x1 + 55} ${y1} ${x2 - 55} ${y2} ${x2} ${y2}`;

/** The home page's actual fragments, showing reuse of Rate and Disclosure fragments. */
export function FragmentTree() {
  const sec = [
    { path: "home/hero", model: "Bank Hero · split", y: 20 },
    { path: "home/rates", model: "Rates Table", y: 130 },
    { path: "home/accounts", model: "Product List", y: 290 },
    { path: "home/app-feature", model: "Feature Split · media right", y: 410 },
    { path: "home/cta", model: "Cta Band · spruce", y: 520 },
  ].map((n) => ({ ...n, c: n.y + 26 }));
  const rates = ["high-yield-savings", "cd-12-month", "mortgage-30-fixed"].map((p, i) => ({ path: `rates/${p}`, y: 20 + i * 66, c: 46 + i * 66 }));
  const products = ["checking", "savings", "credit-cards", "home-loans"].map((p, i) => ({ path: `products/${p}`, y: 262 + i * 60, c: 288 + i * 60 }));
  const disc = { deposit: { y: 40, c: 66 }, lending: { y: 152, c: 178 }, notice: { y: 520, c: 546 } };
  const [hero, rt, acc] = sec;

  return (
    <svg className={s.diagram} viewBox="0 0 1400 620" role="img" aria-labelledby="ft-t ft-d">
      <title id="ft-t">The home page fragment tree</title>
      <desc id="ft-d">
        The home Screen references five section fragments and three disclosures. The hero and the rates table both reference the
        high-yield savings and 12-month CD rates, so those fragments are authored once and reused. Rates reference the deposit-rates
        or lending disclosure, which the Screen also lists for the footer.
      </desc>
      <Markers />

      <Node x={20} y={250} w={230} h={64} root path="home/home" model="Screen" />
      <path d="M250 282 H290" className={s.cmEdge} />
      <path d={`M290 ${sec[0].c} V${sec[4].c}`} className={s.cmEdge} />
      {sec.map((n) => (
        <g key={n.path}>
          <path d={`M290 ${n.c} H326`} className={s.cmEdge} markerEnd="url(#cm-a)" />
          <Node x={330} y={n.y} w={290} path={n.path} model={n.model} />
        </g>
      ))}

      {[
        [hero.c, 0],
        [hero.c, 1],
        [rt.c, 0],
        [rt.c, 1],
        [rt.c, 2],
      ].map(([from, to]) => (
        <path key={`${from}-${to}`} d={curve(620, from, 746, rates[to].c)} className={s.cmEdge} markerEnd="url(#cm-a)" />
      ))}
      {rates.map((r, i) => (
        <Node key={r.path} x={750} y={r.y} w={300} path={r.path} model={`Rate · sample${i < 2 ? " · used twice" : ""}`} reused={i < 2} />
      ))}

      {products.map((p) => (
        <g key={p.path}>
          <path d={curve(620, acc.c, 746, p.c)} className={s.cmEdge} markerEnd="url(#cm-a)" />
          <Node x={750} y={p.y} w={300} path={p.path} model="Product Line" />
        </g>
      ))}

      {[rates[0].c, rates[1].c].map((c) => (
        <path key={c} d={curve(1050, c, 1136, disc.deposit.c)} className={s.cmEdge} markerEnd="url(#cm-a)" />
      ))}
      <path d={curve(1050, rates[2].c, 1136, disc.lending.c)} className={s.cmEdge} markerEnd="url(#cm-a)" />

      <Node x={1140} y={disc.deposit.y} w={250} reused path="disclosures/deposit-rates" model="Disclosure" />
      <Node x={1140} y={disc.lending.y} w={250} reused path="disclosures/lending" model="Disclosure" />
      <Node x={1140} y={disc.notice.y} w={250} path="disclosures/demo-notice" model="Disclosure" />

      {/* Screen.disclosures → all three, for the footer */}
      <path d="M135 314 V606 H1100" className={s.cmEdgeDash} />
      <path d={`M1100 606 V${disc.deposit.c}`} className={s.cmEdgeDash} />
      {[disc.deposit.c, disc.lending.c, disc.notice.c].map((c) => (
        <path key={c} d={`M1100 ${c} H1136`} className={s.cmEdgeDash} markerEnd="url(#cm-a-ink)" />
      ))}
      <Label x={700} y={600} anchor="middle">Screen.disclosures (footer)</Label>
    </svg>
  );
}

export function ModelLegend({ enums = false, reused = false }: { enums?: boolean; reused?: boolean }) {
  return (
    <p className={s.legend}>
      <span>
        <i className={s.cmKeyRef} /> Fragment reference ([ ] = ordered list)
      </span>
      <span>
        <i data-dash className={s.cmKeyInk} /> Footer disclosures
      </span>
      {enums && (
        <span>
          <i className={s.cmKeyEnum} /> Enumeration, edited in the properties panel
        </span>
      )}
      {reused && (
        <span>
          <i className={s.cmKeyReused} /> Fragment reused in more than one place
        </span>
      )}
    </p>
  );
}
