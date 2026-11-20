import type { ReactNode } from "react";
import { Code } from "./_deck/Code";
import { FragmentTree, ModelGraph, ModelLegend } from "./_deck/ContentModel";
import { ArchitectureDiagram, DiagramLegend } from "./_deck/Diagram";
import s from "./_deck/deck.module.css";

export type Slide = { id?: string; title: string; lede?: string; tone?: "dark"; cover?: boolean; body: ReactNode };

const LAYOUT = `
export const metadata: Metadata = {
  // Point the editor at your author tier. Every urn:aemconnection: resolves against it.
  other: { "urn:adobe:aue:system:aemconnection": \`aem:\${process.env.NEXT_PUBLIC_AEM_AUTHOR}\` },
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
  "title": "Hero", "id": "hero", "model": "hero",
  "plugins": { "aem": { "cf": {
    "name": "hero", "title": "Hero",
    "cfModel": "/conf/my-site/settings/dam/cfm/models/hero",
    "cfFolder": "/content/dam/my-site/home"
  } } }
}`;

const MODEL = `
{
  "id": "hero",
  "fields": [
    { "component": "text", "name": "title",
      "label": "Title", "valueType": "string", "required": true },
    { "component": "select", "name": "layout", "label": "Layout",
      "options": [
        { "name": "Split: copy beside the image", "value": "split" },
        { "name": "Stacked: one column", "value": "stacked" }
      ] }
  ]
}`;

const FILTERS = `
[
  { "id": "page-sections",
    "components": ["hero", "card-list", "cta"] },
  { "id": "hero-cards", "components": ["card"] }
]`;

const QUERY = `
query pageByPath($path: String!, $variation: String = "master") {
  pageByPath(_path: $path, variation: $variation) {
    item {
      _path _variation _model { title _path }
      title
      sections {
        ... on HeroModel {
          _path _variation _model { title _path }
          title
          layout
          cards {
            ... on CardModel {
              _path _variation _model { title _path }
              title
            }
          }
        }
        ... on CtaModel { … }
      }
    }
  }
}`;

const QUERY_URL = `
export function queryUrl(host, path, variation = "master") {
  // AEM doesn't decode %2F in persisted-query params, so keep slashes literal.
  const enc = (v) => encodeURIComponent(v).replace(/%2F/gi, "/");
  return \`\${host}/graphql/execute.json/my-site/page-by-path\` +
    \`;path=\${enc(path)};variation=\${enc(variation)}\`;
}`;

const MODEL_MANAGER = `
// Key on the CF model title without spaces: "Card List" → CardList.
const components = { Hero, CardList, Cta };

export function ModelManager({ content }) {
  const key = content._model.title.replace(/\\s+/g, "");
  const Component = components[key];
  return Component ? <Component content={content} /> : null;
}`;

const PAGE_MAP = `
<main data-aue-resource={urn(page)}
  data-aue-type="reference" data-aue-label="Page">
  <div data-aue-prop="sections" data-aue-type="container"
    data-aue-filter="page-sections" data-aue-label="Sections">
    {page.sections.map((section) => (
      <ModelManager key={section._path} content={section} />
    ))}
  </div>
</main>`;

const TAGGED = `
export function Hero({ hero }) {
  const urn = (f) => \`urn:aemconnection:\${f._path}/jcr:content/data/master\`;
  return (
    <section data-aue-resource={urn(hero)}
      data-aue-type="reference" data-aue-label="Hero">
      <h1 data-aue-prop="title" data-aue-type="text">{hero.title}</h1>
      <div data-aue-prop="body" data-aue-type="richtext"
        dangerouslySetInnerHTML={{ __html: hero.body.html }} />
      <img data-aue-prop="image" data-aue-type="media"
        src={hero.image._publishUrl} alt="" />

      <ul data-aue-prop="cards" data-aue-type="container" data-aue-filter="hero-cards">
        {hero.cards.map((card) => (
          <li key={card._path} data-aue-resource={urn(card)}
            data-aue-type="reference" data-aue-label="Card">
            <h2 data-aue-prop="title" data-aue-type="text">{card.title}</h2>
          </li>
        ))}
      </ul>
    </section>
  );
}`;

const RENDERED = `
<section data-aue-resource="urn:aemconnection:/content/dam/my-site/home/hero/jcr:content/data/master"
  data-aue-type="reference" data-aue-label="Hero" data-aue-model="hero">
  <h1 data-aue-prop="title" data-aue-type="text" data-aue-label="Title">
    Welcome to My Site.
  </h1>
  <ul data-aue-prop="cards" data-aue-type="container" data-aue-filter="hero-cards">
    <li data-aue-resource="urn:aemconnection:/content/dam/my-site/shared/cards/savings/jcr:content/data/master"
      data-aue-type="reference" data-aue-label="Card">…</li>
  </ul>
</section>`;

const LOAD_PAGE = `
// Server: published content, cached for a few minutes.
export async function loadPage(path) {
  "use cache";
  cacheLife("minutes");
  try {
    return await fetchPage(process.env.AEM_PUBLISH, path);
  } catch {
    return fallbackPage; // a local copy, so the page never breaks
  }
}`;

const EDITOR_READ = `
// Client: inside the editor, re-read the same page from author.
const inEditor = () =>
  window.self !== window.top || new URLSearchParams(location.search).has("aue");

useEffect(() => {
  if (!inEditor()) return;
  fetchPage(process.env.NEXT_PUBLIC_AEM_AUTHOR, page._path, {
    credentials: "include",
    cache: "no-store",
  }).then(setPage);
}, [page._path]);`;

const RESPONSIVE = `
/* Hero.module.css */
.split .grid   { grid-template-columns: 1.15fr 0.85fr; }
.stacked .grid { grid-template-columns: 1fr; max-width: 820px; }

@media (max-width: 1024px) {
  .split .grid { grid-template-columns: 1fr; gap: 48px; }
}`;

/** 1-based slide number for a slide with this id. */
export const slideNumber = (id: string) => slides.findIndex((s) => s.id === id) + 1;

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
          Let&apos;s walk through how to connect a Next.js front end to AEM Content Fragments and make it editable in Universal
          Editor. We&apos;ll start with the architecture, then model the content, then tag the components.
        </p>
        <p className={s.meta}>
          <span>Next.js · React</span>
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
    title: "Visitors read publish. Authors read author.",
    lede: "It's the same page, the same query and the same components. The only thing that changes is the host you read from.",
    body: (
      <div className={s.cols}>
        <div className={`${s.col} ${s.laneVisitor}`}>
          <h2 className={s.laneTitle}>A visitor loads the page</h2>
          <ol className={s.steps}>
            <li>The request hits your Next.js route.</li>
            <li>
              The server runs the persisted query against <strong>publish</strong> and caches the result for a few minutes.
            </li>
            <li>
              Each fragment maps to a React component. The HTML already carries the <code>data-aue-*</code> attributes, and
              outside the editor they don&apos;t do anything.
            </li>
            <li>If AEM can&apos;t be reached, fall back to a local copy so the page still renders.</li>
          </ol>
        </div>
        <div className={`${s.col} ${s.laneEditor}`}>
          <h2 className={s.laneTitle}>An author opens it in Universal Editor</h2>
          <ol className={s.steps}>
            <li>Universal Editor loads the same URL in an iframe.</li>
            <li>
              <code>cors.js</code> connects the page. The editor reads the connection meta tag, the three JSON files and every{" "}
              <code>data-aue-*</code> attribute.
            </li>
            <li>
              The app sees it&apos;s inside the editor and re-runs the query against <strong>author</strong> with{" "}
              <code>credentials: &quot;include&quot;</code>, so drafts show up.
            </li>
            <li>
              Edits save to the fragment named in <code>data-aue-resource</code>. Publish, and visitors see them.
            </li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    title: "Before Universal Editor can open your page",
    body: (
      <div className={`${s.cols} ${s.colsWide}`}>
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>Use HTTPS everywhere</strong>, localhost included (<code>next dev --experimental-https</code>). The editor
              runs on HTTPS and can&apos;t frame an HTTP page.
            </li>
            <li>
              <strong>Load <code>cors.js</code></strong> from <code>universal-editor-service.adobe.io</code>. The old corslib and
              npm package are deprecated.
            </li>
            <li>
              <strong>Add the connection meta tag</strong> and point it at your author host. Every resource on the page resolves
              against it.
            </li>
            <li>
              <strong>Allow framing.</strong> Make sure no <code>X-Frame-Options</code> or <code>frame-ancestors</code> header
              blocks the editor.
            </li>
            <li>
              <strong>Have author trust your app.</strong> Allow your app&apos;s origin in CORS with credentials, and set the
              login-token cookie to <code>Partitioned</code>.
            </li>
            <li>
              <strong>Render the attributes on the server</strong> so they&apos;re in the first HTML the editor sees.
            </li>
          </ul>
        </div>
        <Code caption="app/layout.tsx" code={LAYOUT} hl={[3, 10, 11, 12, 16]} />
      </div>
    ),
  },
  {
    title: "Register a component, 1\u00a0of\u00a03: what can be added",
    lede: "component-definition.json. The editor loads it, and the next two files, from <script> tags in the head.",
    body: (
      <div className={`${s.cols} ${s.colsWide}`}>
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>Think of it as the menu of building blocks.</strong> Each entry is a section an author can add to a page
              with the editor&apos;s <em>Add</em> button.
            </li>
            <li>
              <strong><code>id</code></strong> is the component&apos;s name, and filters refer to it.{" "}
              <strong><code>model</code></strong> points to its form in the properties panel.
            </li>
            <li>
              <strong><code>cfModel</code></strong> tells the editor which Content Fragment Model to build a new section from.
            </li>
            <li>
              <strong><code>cfFolder</code></strong> tells it where in Assets to save the new fragment.
            </li>
          </ul>
        </div>
        <Code caption="component-definition.json" lang="json" code={DEFINITION} hl={[2, 5, 6]} />
      </div>
    ),
  },
  {
    title: "Register a component, 2\u00a0of\u00a03: the properties panel",
    lede: "component-models.json. This is the form an author sees on the right when they select a section.",
    body: (
      <div className={`${s.cols} ${s.colsWide}`}>
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>You get one form per model.</strong> Its <code>id</code> matches the <code>model</code> in the definition.
            </li>
            <li>
              <strong>Each field is one input.</strong> <code>component</code> is the kind of input (text box, dropdown),{" "}
              <code>name</code> is the fragment field it saves to, and <code>label</code> is what the author reads.
            </li>
            <li>
              <strong>Use dropdowns to limit the choices</strong> to values your component actually supports.
            </li>
            <li>
              <strong>For fragments, the form is optional.</strong> Leave it out and the panel shows the Content Fragment
              Model&apos;s fields. Add one when you need a custom input like a dropdown. It replaces those fields, so list every
              field you want authors to edit.
            </li>
          </ul>
        </div>
        <Code caption="component-models.json" lang="json" code={MODEL} hl={[2, 4, 6]} />
      </div>
    ),
  },
  {
    title: "Register a component, 3\u00a0of\u00a03: what goes where",
    lede: "component-filters.json. These are the rules for which sections each list on the page accepts.",
    body: (
      <div className={`${s.cols} ${s.colsWide}`}>
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>A container is a list authors can add to and reorder</strong>, like the sections on a page or the cards
              in a hero.
            </li>
            <li>
              <strong>Each filter is a named allow-list.</strong> You point a container at one with <code>data-aue-filter</code>.
            </li>
            <li>
              <strong>List the component ids a container can hold.</strong> Anything else stays out of its <em>Add</em> menu.
            </li>
            <li>
              <strong>Give each container its own filter</strong>: one for the page&apos;s sections, another for the items inside a
              section.
            </li>
            <li>
              <strong>The ids tie the three files together</strong>: filter → component → model.
            </li>
          </ul>
        </div>
        <Code caption="component-filters.json" lang="json" code={FILTERS} hl={[2, 4]} />
      </div>
    ),
  },
  {
    title: "Ask AEM for exactly what the page renders",
    body: (
      <div className={s.cols}>
        <Code caption="page-by-path.graphql, persisted as my-site/page-by-path" lang="graphql" code={QUERY} hl={[4, 8, 13]} />
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>Use persisted queries.</strong> They&apos;re plain GETs, so the CDN and Dispatcher can cache them, and you
              don&apos;t need a GraphQL client in the app.
            </li>
            <li>
              <strong>Return <code>_path</code>, <code>_variation</code> and <code>_model</code> on every fragment.</strong> The
              path and variation build the editor URN, and the model title picks the React component.
            </li>
            <li>
              <strong>Write one query per page type.</strong> The page fragment pulls in its sections and everything they
              reference in a single round trip.
            </li>
          </ul>
          <Code caption="Building the query URL" code={QUERY_URL} hl={[2, 3]} />
        </div>
      </div>
    ),
  },
  {
    title: "Map fragments to components by model title",
    body: (
      <div className={s.cols}>
        <div className={s.col}>
          <Code caption="ModelManager.tsx" code={MODEL_MANAGER} hl={[2, 5, 6]} />
        </div>
        <div className={s.col}>
          <Code caption="Rendering the page" code={PAGE_MAP} hl={[3, 4, 6]} />
          <ul className={s.list}>
            <li>
              The <code>Hero</code> model becomes <code>&lt;Hero&gt;</code>, and the query&apos;s{" "}
              <code>... on HeroModel</code> gives it typed fields.
            </li>
            <li>
              <strong>To add a section type</strong>, you need one model, one component, one line in the mapping and one fragment
              in the query.
            </li>
            <li>
              Make the <code>sections</code> field a container, and authors can add, remove and reorder sections in Universal
              Editor.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "models",
    title: "Example: the WKND Bank content model",
    body: (
      <>
        <ModelGraph />
        <ModelLegend enums clickable />
      </>
    ),
  },
  {
    title: "Example: the WKND Bank home page",
    body: (
      <>
        <FragmentTree />
        <ModelLegend reused />
      </>
    ),
  },
  {
    title: "Organize fragments by who owns them",
    lede: "Keep a page and its sections together. Give shared content its own folder so every page can reference it.",
    body: (
      <div className={`${s.cols} ${s.colsWide}`}>
        <div className={s.col}>
          <p className={s.small}>
            Example: <code>/content/dam/wknd-bank/site/en</code>
          </p>
          <ul className={s.tree}>
            {[
              ["home/", ["Screen", "Bank Hero", "Rates Table", "Product List", "Feature Split", "Cta Band"]],
              ["rates/", ["Rate"]],
              ["products/", ["Product Line"]],
              ["disclosures/", ["Disclosure"]],
            ].map(([folder, models]) => (
              <li key={folder as string}>
                <code>{folder}</code>
                <span className={s.chips}>
                  {(models as string[]).map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>Put a page and its sections in one folder.</strong> They get created and edited together.
            </li>
            <li>
              <strong>Store shared content once.</strong> If more than one page uses it, give it its own folder and reference it.
              Don&apos;t copy it.
            </li>
            <li>
              <strong>Limit each folder to the models it should hold</strong> with the folder&apos;s allowed Content Fragment
              Models policy.
            </li>
            <li>
              <strong>Set <code>cfFolder</code> on each component definition</strong> so fragments added in Universal Editor land
              in the right place.
            </li>
            <li>
              <strong>Keep typed fields typed.</strong> Numbers, dates and enumerations belong in the properties panel, not
              inline on the page.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Map every model before you write code",
    lede: "Each Content Fragment Model gets one GraphQL type and one React component. Each list of references gets a filter.",
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
            ["Page", "pageByPath (root)", "<main>", "sections → page-sections"],
            ["Hero", "HeroModel", "Hero", "cards → hero-cards"],
            ["Card List", "CardListModel", "CardList", "cards → card-list-cards"],
            ["Card", "CardModel", "item inside Hero and CardList", "—"],
            ["CTA", "CtaModel", "Cta", "—"],
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
    title: "Tag a component for Universal Editor",
    lede: "Add data-aue-* attributes to the markup you already render. You don't need a library or an SDK.",
    body: (
      <div className={`${s.cols} ${s.colsWide}`}>
        <div className={s.col}>
          <ul className={s.list}>
            <li>
              <strong>1. Mark the fragment.</strong> On the element that renders it, set <code>data-aue-resource</code> to{" "}
              <code>urn:aemconnection:</code> + its path + <code>/jcr:content/data/master</code>, with{" "}
              <code>data-aue-type=&quot;reference&quot;</code> and a label.
            </li>
            <li>
              <strong>2. Mark each editable field.</strong> <code>data-aue-prop</code> names the fragment field, and{" "}
              <code>data-aue-type</code> is <code>text</code>, <code>richtext</code> or <code>media</code>. A field belongs to
              the nearest fragment above it.
            </li>
            <li>
              <strong>3. Mark lists of fragments.</strong> The wrapper is a <code>container</code> with a filter, and each item is
              its own fragment.
            </li>
            <li>
              <strong>4. Ask for the path.</strong> Your query has to return each fragment&apos;s <code>_path</code>, or you
              can&apos;t build the URN.
            </li>
          </ul>
        </div>
        <Code caption="Hero.tsx" code={TAGGED} hl={[4, 5, 6, 7, 9, 12, 14, 15, 16]} />
      </div>
    ),
  },
  {
    title: "What Universal Editor reads from the page",
    body: (
      <div className={s.cols}>
        <Code caption="The server-rendered hero" lang="html" code={RENDERED} />
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Attribute</th>
              <th scope="col">What it tells the editor</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["data-aue-resource", "Which fragment and variation: connection + path + /jcr:content/data/master"],
              ["data-aue-type", "reference, container, text, richtext, media or component"],
              ["data-aue-prop", "Which field inside the nearest resource"],
              ["data-aue-model", "Which form to show in the properties panel. It wins over the definition"],
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
              <td>Adobe recommends no more than 25 AEM resources instrumented on one page.</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: "Read publish on the server, author only inside the editor",
    lede: "Visitors never wait on author, and authors always see their drafts.",
    body: (
      <div className={s.cols}>
        <Code caption="Published content on the server" code={LOAD_PAGE} hl={[3, 4, 8]} />
        <Code caption="Draft content in the editor" code={EDITOR_READ} hl={[2, 6, 8, 9]} />
      </div>
    ),
  },
  {
    title: "Building a page, and where responsive behavior lives",
    body: (
      <div className={s.cols}>
        <div className={s.col}>
          <h2>Composing in Universal Editor</h2>
          <ol className={s.steps}>
            <li>Open the page. The content tree shows the page fragment and its sections container.</li>
            <li>
              Add a section. The container&apos;s filter decides what&apos;s offered, and the new fragment is created in the
              definition&apos;s <code>cfFolder</code>.
            </li>
            <li>Drag sections to reorder them, and edit text right on the page.</li>
            <li>
              Pick a design variant in the properties panel. A field like <code>layout: split | stacked</code> is just data, so it
              comes back in the query.
            </li>
          </ol>
        </div>
        <div className={s.col}>
          <h2>Responsive is app code</h2>
          <Code caption="The layout field maps to classes, and CSS owns the breakpoints" lang="css" code={RESPONSIVE} />
          <p className={s.note}>
            Universal Editor previews device widths, but unlike the classic Page Editor it has{" "}
            <strong>no responsive layout grid</strong>. Authors pick a variant, and developers own the breakpoints.
          </p>
        </div>
      </div>
    ),
  },
];
