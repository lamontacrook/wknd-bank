import Link from "next/link";
import type { ReactNode } from "react";
import { Code } from "./_deck/Code";
import { ArchitectureDiagram, DiagramLegend } from "./_deck/Diagram";
import s from "./_deck/deck.module.css";

export type Slide = { title: string; lede?: string; tone?: "dark"; cover?: boolean; body: ReactNode };

const LAYOUT = `
export const metadata: Metadata = {
  // Which AEM the urn:aemconnection:… resources live on: author.
  other: { "urn:adobe:aue:system:aemconnection": \`aem:\${AEM_AUTHOR}\` },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script type="application/vnd.adobe.aue.component+json" src="/component-definition.json" async />
        <script type="application/vnd.adobe.aue.model+json" src="/component-models.json" async />
        <script type="application/vnd.adobe.aue.filter+json" src="/component-filters.json" async />
      </head>
      <body>
        {children}
        <Script src="https://universal-editor-service.adobe.io/cors.js" />
      </body>
    </html>
  );
}`;

const DEFINITION = `
{
  "title": "Bank Hero", "id": "bank-hero", "model": "bank-hero",
  "plugins": { "aem": { "cf": {
    "name": "bank-hero", "title": "Bank Hero",
    "cfModel": "/conf/wknd-bank/settings/dam/cfm/models/bank-hero",
    "cfFolder": "/content/dam/wknd-bank/site/en/home"
  } } }
}`;

const MODEL = `
{
  "id": "bank-hero",
  "fields": [
    { "component": "text", "name": "headline",
      "label": "Headline", "valueType": "string", "required": true },
    { "component": "select", "name": "layout", "label": "Layout",
      "options": [
        { "name": "Split: copy beside the rate ledger", "value": "split" },
        { "name": "Stacked: one column", "value": "stacked" }
      ] }
  ]
}`;

const FILTERS = `
[
  { "id": "screen-block",
    "components": ["bank-hero", "rates-table", "product-list",
                   "feature-split", "cta-band"] },
  { "id": "bank-hero-rates", "components": ["rate"] }
]`;

const QUERY = `
query screenByPath($path: String!, $variation: String = "master") {
  screenByPath(_path: $path, variation: $variation) {
    item {
      _path _variation _model { title _path }
      title
      block {
        ... on BankHeroModel {
          _path _variation _model { title _path }
          headline
          layout
          rates {
            ... on RateModel {
              _path _variation _model { title _path }
              product  rate  status
            }
          }
        }
        ... on RatesTableModel { … }
      }
    }
  }
}`;

const QUERY_URL = `
export function queryUrl(host: string, path = HOME_PATH, variation = "master") {
  // AEM doesn't decode %2F in persisted-query params: keep slashes literal.
  const enc = (v: string) => encodeURIComponent(v).replace(/%2F/gi, "/");
  return \`\${host}/graphql/execute.json/wknd-bank/screen-by-path\` +
    \`;path=\${enc(path)};variation=\${enc(variation)}\`;
}`;

const MODEL_MANAGER = `
// Keyed on the CF model title without spaces: "Bank Hero" → BankHero.
export const componentMapping = {
  BankHero,
  RatesTable,
  ProductList,
  FeatureSplit,
  CtaBand,
};

export function ModelManager({ content }: { content: Block }) {
  const key = content?._model?.title?.replace(/\\s+/g, "") ?? "";
  const Component = componentMapping[key];
  if (Component) return <Component content={content} />;
  return null; // dev builds show "Add <model> to ModelManager"
}`;

const SCREEN_MAP = `
<main
  {...aueFragment(screen, { label: "Screen", type: "container" })}
  {...aueContainer("block", { label: "Sections", filter: "screen-block" })}
>
  {screen.block.map((block) => (
    <ModelManager key={block._path} content={block} />
  ))}
</main>`;

const AUE_HELPERS = `
export const cfResource = (item) =>
  \`urn:aemconnection:\${item._path}/jcr:content/data/\${item._variation || "master"}\`;

export const aueFragment = (item, { label, model, filter, type = "reference" } = {}) => ({
  "data-aue-resource": cfResource(item),
  "data-aue-type": type,
  "data-aue-label": label || item._model.title,
  ...(model && { "data-aue-model": model }),
  ...(filter && { "data-aue-filter": filter }),
});

export const aueProp = (prop, type = "text", label = prop) => ({
  "data-aue-prop": prop, "data-aue-type": type, "data-aue-label": label,
});

export const aueContainer = (prop, { label, filter } = {}) => ({
  "data-aue-prop": prop, "data-aue-type": "container",
  "data-aue-label": label || prop,
  ...(filter && { "data-aue-filter": filter }),
});`;

const BANK_HERO = `
export function BankHero({ content }: { content: BankHeroContent }) {
  return (
    <section className={styles.hero} {...aueFragment(content, { model: "bank-hero" })}>
      <h1 {...aueProp("headline", "text", "Headline")}>{content.headline}</h1>
      <p {...aueProp("subHeadline", "text", "Sub-headline")}>{content.subHeadline}</p>

      <dl {...aueContainer("rates", { label: "Rates", filter: "bank-hero-rates" })}>
        {content.rates.map((rate) => (
          <div key={rate._path} {...aueFragment(rate, { model: "rate" })}>
            <dt {...aueProp("product")}>{rate.product}</dt>
            <dd><RateFigure rate={rate} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}`;

const RENDERED = `
<section data-aue-resource="urn:aemconnection:/content/dam/wknd-bank/site/en/home/hero/jcr:content/data/master"
  data-aue-type="reference" data-aue-label="Bank Hero" data-aue-model="bank-hero">
  <h1 data-aue-prop="headline" data-aue-type="text" data-aue-label="Headline">
    Banking that shows its work.
  </h1>
  <dl data-aue-prop="rates" data-aue-type="container" data-aue-filter="bank-hero-rates">
    <div data-aue-resource="urn:aemconnection:/content/dam/wknd-bank/site/en/rates/high-yield-savings/jcr:content/data/master"
      data-aue-type="reference" data-aue-model="rate">…</div>
  </dl>
</section>`;

const LOAD_SCREEN = `
// lib/load-screen.ts: server only, published content, cached for minutes.
export async function loadScreen(path = HOME_PATH) {
  "use cache";
  cacheLife("minutes");
  if (!AEM_HOST) return { screen: mockScreen, source: "mock" };
  try {
    return { screen: await fetchScreen(AEM_HOST, { path }), source: "aem" };
  } catch {
    return { screen: mockScreen, source: "mock" };
  }
}`;

const SCREEN_VIEW = `
// components/ScreenView.tsx: client. Inside UE, re-read from author.
useEffect(() => {
  if (!AEM_AUTHOR || !inEditor()) return;
  fetchScreen(AEM_AUTHOR, {
    path: initial._path,
    init: { credentials: "include", cache: "no-store" },
  }).then((s) => {
    setScreen(s);
    setSource("author");
  });
}, [initial._path]);

// lib/editor.ts
export const inEditor = () =>
  window.self !== window.top || new URLSearchParams(location.search).has("aue");`;

const RESPONSIVE = `
/* components/BankHero.module.css */
.split .grid   { grid-template-columns: 1.15fr 0.85fr; }
.stacked .grid { grid-template-columns: 1fr; max-width: 820px; }

@media (max-width: 1024px) {
  .split .grid { grid-template-columns: 1fr; gap: 48px; }
}`;

const SCREEN_JSON = `
{
  "_path": "/content/dam/wknd-bank/site/en/home/home",
  "_variation": "master",
  "_model": { "title": "Screen" },
  "title": "WKND Bank — Home",
  "block": [
    {
      "_path": "/content/dam/wknd-bank/site/en/home/hero",
      "_model": { "title": "Bank Hero" },
      "headline": "Banking that shows its work.",
      "layout": "split",
      "rates": [
        {
          "_path": "/content/dam/wknd-bank/site/en/rates/high-yield-savings",
          "_model": { "title": "Rate" },
          "product": "High-yield savings", "rate": 0, "status": "sample"
        }
      ]
    }
  ]
}`;

export const slides: Slide[] = [
  {
    title: "Universal Editor on AEM headless",
    tone: "dark",
    cover: true,
    body: (
      <>
        <h1>
          Edit the <em>real</em> React site, in place.
        </h1>
        <p>
          How WKND Bank&apos;s Next.js front end reads Content Fragments from AEM and becomes editable in Universal Editor: the
          architecture, then the React code that makes it work.
        </p>
        <p className={s.meta}>
          <span>Next.js 16 · React 19</span>
          <span>AEM as a Cloud Service</span>
          <span>Content Fragments + persisted GraphQL</span>
        </p>
      </>
    ),
  },
  {
    title: "One set of fragments, two tiers, one editor",
    body: (
      <>
        <ArchitectureDiagram />
        <DiagramLegend />
      </>
    ),
  },
  {
    title: "Visitors read publish. Editors read author.",
    lede: "The same page, the same query and the same components. Only the host it reads from changes.",
    body: (
      <div className={s.cols}>
        <div className={`${s.col} ${s.laneVisitor}`}>
          <h2 className={s.laneTitle}>A visitor loads the page</h2>
          <ol className={s.steps}>
            <li>The request hits the Next.js route, <code>app/page.tsx</code>.</li>
            <li>
              <code>loadScreen()</code> runs the persisted query on <strong>publish</strong>. The result is cached for minutes with{" "}
              <code>&quot;use cache&quot;</code>.
            </li>
            <li>
              <code>ModelManager</code> turns each fragment into a React section. The HTML ships with <code>data-aue-*</code> already
              in it, and it does nothing outside the editor.
            </li>
            <li>If AEM can&apos;t be reached, the page renders the bundled mock instead of failing.</li>
          </ol>
        </div>
        <div className={`${s.col} ${s.laneEditor}`}>
          <h2 className={s.laneTitle}>An author opens it in Universal Editor</h2>
          <ol className={s.steps}>
            <li>Universal Editor loads the same URL in an iframe.</li>
            <li>
              <code>cors.js</code> connects the page. The editor reads the connection meta, the three JSON files and every{" "}
              <code>data-aue-*</code> element.
            </li>
            <li>
              <code>inEditor()</code> is true, so <code>ScreenView</code> re-runs the query on <strong>author</strong> with{" "}
              <code>credentials: &quot;include&quot;</code>. Drafts show up.
            </li>
            <li>
              Edits are written to the fragment named by <code>data-aue-resource</code>. Publishing pushes them to visitors.
            </li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    title: "Runtime work before Universal Editor can open a page",
    body: (
      <div className={`${s.cols} ${s.colsWide}`}>
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>HTTPS everywhere</strong>, localhost included (<code>npm run dev:https</code>). An HTTPS editor can&apos;t frame
              an HTTP page.
            </li>
            <li>
              <strong>Load <code>cors.js</code></strong> from <code>universal-editor-service.adobe.io</code>. The old corslib and npm
              package are deprecated.
            </li>
            <li>
              <strong>Connection meta</strong> pointing at the author host. Every URN resolves against it.
            </li>
            <li>
              <strong>Allow framing</strong>: no <code>X-Frame-Options</code> or <code>frame-ancestors</code> that blocks the editor.
            </li>
            <li>
              <strong>Author trusts the app</strong>: CORS for the app origin with credentials, and the login-token cookie set to{" "}
              <code>Partitioned</code>.
            </li>
            <li>
              <strong>Render attributes on the server</strong> so they are in the first HTML the editor sees.
            </li>
          </ul>
          <p className={s.note}>
            <strong>Angular SPAs</strong> follow the same contract: markup only, no SDK. Adobe&apos;s docs name Next.js, React and
            Astro and ship no Angular sample.
          </p>
        </div>
        <Code caption="app/layout.tsx" code={LAYOUT} hl={[3, 10, 11, 12, 16]} />
      </div>
    ),
  },
  {
    title: "Register a component: three JSON files",
    lede: "The editor loads them from <script> tags in the head. Ids tie them together: component → model → filter.",
    body: (
      <div className={s.cols}>
        <div className={s.col}>
          <Code caption="public/component-definition.json: what can be added, and where its fragment lives" lang="json" code={DEFINITION} hl={[2, 6, 7]} />
          <Code caption="public/component-filters.json: what each container accepts" lang="json" code={FILTERS} hl={[2]} />
        </div>
        <Code caption="public/component-models.json: the properties rail" lang="json" code={MODEL} hl={[2]} />
      </div>
    ),
  },
  {
    title: "Ask AEM for exactly what the page renders",
    body: (
      <div className={s.cols}>
        <Code caption="aem/screen-by-path.graphql, persisted as wknd-bank/screen-by-path" lang="graphql" code={QUERY} hl={[4, 8, 14]} />
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>Persisted queries are plain GETs</strong>, so the CDN and Dispatcher can cache them. No GraphQL client in the app.
            </li>
            <li>
              <strong>Every fragment returns <code>_path</code>, <code>_variation</code> and <code>_model</code>.</strong> The path
              and variation build the editor URN. The model title picks the React component.
            </li>
            <li>
              <strong>One query per page type.</strong> The Screen fragment pulls in its sections, their rates and the disclosures in a
              single round trip.
            </li>
          </ul>
          <Code caption="lib/aem.ts" code={QUERY_URL} hl={[2, 3]} />
        </div>
      </div>
    ),
  },
  {
    title: "Map fragments to components by model title",
    body: (
      <div className={s.cols}>
        <div className={s.col}>
          <Code caption="components/ModelManager.tsx" code={MODEL_MANAGER} hl={[2, 11, 13]} />
        </div>
        <div className={s.col}>
          <Code caption="components/ScreenView.tsx" code={SCREEN_MAP} hl={[3, 6]} />
          <ul className={s.list}>
            <li>
              The <code>Bank Hero</code> model becomes <code>&lt;BankHero&gt;</code>. The query&apos;s <code>... on BankHeroModel</code>{" "}
              gives it typed fields.
            </li>
            <li>
              <strong>Adding a section type</strong> takes one model, one component, one line in the mapping and one fragment in the
              query.
            </li>
            <li>
              The <code>block</code> field is a container, so authors add, remove and reorder sections in Universal Editor.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "The whole content model, mapped",
    lede: "Each Content Fragment model has one GraphQL type and one React home. Containers name the filter that limits what goes in them.",
    body: (
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">CF model</th>
            <th scope="col">GraphQL type</th>
            <th scope="col">React</th>
            <th scope="col">Container field → filter</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Screen", "screenByPath (root)", "ScreenView (<main>)", "block → screen-block · disclosures → screen-disclosures"],
            ["Bank Hero", "BankHeroModel", "BankHero", "rates → bank-hero-rates"],
            ["Rates Table", "RatesTableModel", "RatesTable", "rates → rates-table-rates"],
            ["Product List", "ProductListModel", "ProductList", "items → product-list-items"],
            ["Product Line", "ProductLineModel", "item inside ProductList", "—"],
            ["Feature Split", "FeatureSplitModel", "FeatureSplit", "—"],
            ["CTA Band", "CtaBandModel", "CtaBand", "—"],
            ["Rate", "RateModel", "row in BankHero and RatesTable (RateFigure)", "—"],
            ["Disclosure", "DisclosureModel", "SiteFooter legal copy", "—"],
          ].map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i}>{i === 0 ? cell : <code>{cell}</code>}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    title: "Instrument a component with three helpers",
    lede: "Existing components keep their markup and styles. They gain attribute spreads, and their data must carry _path and _model.",
    body: (
      <div className={s.cols}>
        <Code caption="lib/aue.ts (types trimmed)" code={AUE_HELPERS} hl={[2, 5, 12, 16]} />
        <Code caption="components/BankHero.tsx (trimmed)" code={BANK_HERO} hl={[3, 4, 5, 7, 9, 10]} />
      </div>
    ),
  },
  {
    title: "What Universal Editor reads from the DOM",
    body: (
      <div className={s.cols}>
        <Code caption="Server-rendered HTML for the hero" lang="html" code={RENDERED} />
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Attribute</th>
              <th scope="col">Tells the editor</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["data-aue-resource", "Which fragment and variation: connection + path + /jcr:content/data/master"],
              ["data-aue-type", "reference, container, text, richtext, media or component"],
              ["data-aue-prop", "The field inside the nearest resource"],
              ["data-aue-model", "Which model drives the properties rail; wins over the definition"],
              ["data-aue-filter", "Which components a container accepts"],
              ["data-aue-label", "The name in the content tree"],
            ].map(([a, b]) => (
              <tr key={a}>
                <td>
                  <code>{a}</code>
                </td>
                <td>{b}</td>
              </tr>
            ))}
            <tr>
              <td>Limit</td>
              <td>Adobe advises no more than 25 AEM resources instrumented on one page.</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: "Server first, author only inside the editor",
    lede: "Visitors never wait on author, and authors always see drafts. A badge on the page says which source rendered it.",
    body: (
      <div className={s.cols}>
        <Code caption="Published content on the server" code={LOAD_SCREEN} hl={[3, 4, 7]} />
        <Code caption="Draft content in the editor" code={SCREEN_VIEW} hl={[3, 6, 15]} />
      </div>
    ),
  },
  {
    title: "Designing a page, and where responsive behaviour lives",
    body: (
      <div className={s.cols}>
        <div className={s.col}>
          <h2>Composing in Universal Editor</h2>
          <ol className={s.steps}>
            <li>Open the page. The content tree shows the Screen and its Sections container.</li>
            <li>
              Add a section. The <code>screen-block</code> filter offers only the five section types. The new fragment is created in
              the definition&apos;s <code>cfFolder</code>.
            </li>
            <li>Drag sections to reorder them, and edit text directly on the page.</li>
            <li>
              Pick a design variant in the properties rail. <code>layout: split | stacked</code> is an ordinary field, so it comes back
              in the JSON.
            </li>
          </ol>
        </div>
        <div className={s.col}>
          <h2>Responsive is app code</h2>
          <Code caption="The layout field maps to classes, and CSS owns the breakpoints" lang="css" code={RESPONSIVE} />
          <p className={s.note}>
            Universal Editor previews device widths but has <strong>no responsive layout grid</strong>, unlike the classic Page
            Editor. Authors pick a variant; developers own the breakpoints.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "The “design file” is the Screen fragment",
    body: (
      <div className={s.cols}>
        <Code caption="GET …/screen-by-path → data.screenByPath.item (excerpt)" lang="json" code={SCREEN_JSON} hl={[5, 11, 12]} />
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>There is no separate design file</strong> for headless. A page is a Screen fragment whose <code>block</code>{" "}
              field references section fragments.
            </li>
            <li>
              <strong>Stored in AEM Assets</strong> as Content Fragments under <code>/content/dam/wknd-bank</code>, not as a file.
            </li>
            <li>
              <strong>Returned by the GraphQL API</strong> through persisted queries on author and publish. The Content Fragment
              Delivery OpenAPI is the REST alternative.
            </li>
            <li>
              <strong>Design choices are content.</strong> Order, variants such as <code>layout</code>, and links all arrive in this
              JSON.
            </li>
            <li>
              The three Universal Editor JSON files are app configuration. Here they ship from <code>/public</code>, not from AEM.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Making it ready for AI agents",
    lede: "The delivery JSON is already clean and typed. The agent-shaped format is a thin layer you build.",
    body: (
      <div className={s.cols}>
        <div className={s.col}>
          <h2>What you get today</h2>
          <ul className={s.list}>
            <li>
              Typed JSON where every node names its model (<code>_model.title</code>) and its source (<code>_path</code>).
            </li>
            <li>
              <code>component-models.json</code> already labels and describes every field, so it can serve as the schema.
            </li>
            <li>Persisted queries are a stable, cacheable, versionable API.</li>
            <li>The AEM MCP server lets agents read and write fragments. This demo&apos;s models and fragments were created with it.</li>
          </ul>
        </div>
        <div className={s.col}>
          <h2>What you would build</h2>
          <ul className={s.list}>
            <li>
              A transform, such as a Next.js route handler at <code>/api/agent/screen</code>, that flattens references and drops
              presentation-only fields like <code>layout</code>.
            </li>
            <li>Field descriptions merged in from the models, so an agent knows what each value means.</li>
            <li>Output as JSON-LD or Markdown, plus disclosures kept beside the rates they qualify.</li>
            <li>Guardrails for agents that write, such as the sample status on rates and a human publish step.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Go-live checklist and the gotchas we hit",
    body: (
      <div className={s.cols}>
        <div className={s.col}>
          <h2>Checklist</h2>
          <ul className={s.list}>
            <li>Models, fragments, the GraphQL endpoint and persisted queries are published.</li>
            <li>Author CORS allows the app origin with credentials, and the login-token cookie is Partitioned.</li>
            <li>
              The app runs on HTTPS with <code>NEXT_PUBLIC_AEM_AUTHOR</code> and <code>NEXT_PUBLIC_AEM_HOST</code> set.
            </li>
            <li>Every editable element renders on the server with its <code>data-aue-*</code> attributes.</li>
            <li>No more than 25 instrumented AEM resources on a page.</li>
          </ul>
        </div>
        <div className={s.col}>
          <h2>Gotchas</h2>
          <ul className={s.list}>
            <li>
              <code>%2F</code> in a persisted-query path returns &ldquo;no resource available&rdquo;. Keep slashes literal.
            </li>
            <li>
              A new <code>/conf</code> needs its parent pages published too, or publish answers 404 even after replication succeeds.
            </li>
            <li>A local certificate the browser doesn&apos;t trust fails silently inside the editor iframe. Install the mkcert CA.</li>
            <li>Published pages are cached for minutes, so a publish shows up after the cache window.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "See it working",
    tone: "dark",
    lede: "Turn on “Show Universal Editor data” in the site footer to outline every instrumented element by type.",
    body: (
      <div className={s.cols}>
        <ul className={s.list}>
          <li>
            <code>lib/aue.ts</code>: URN and attribute helpers
          </li>
          <li>
            <code>components/ModelManager.tsx</code>: model title → component
          </li>
          <li>
            <code>components/ScreenView.tsx</code>: author re-read in the editor
          </li>
          <li>
            <code>lib/load-screen.ts</code>: cached publish read with mock fallback
          </li>
          <li>
            <code>public/component-*.json</code>: the editor&apos;s registry
          </li>
          <li>
            <code>aem/screen-by-path.graphql</code>: the persisted query
          </li>
        </ul>
        <div className={s.col}>
          <p className={s.lead}>Questions, then open the home page in Universal Editor and edit a rate live.</p>
          <p>
            <Link className="btn btn-accent" href="/">
              Open the site
            </Link>
          </p>
        </div>
      </div>
    ),
  },
];
