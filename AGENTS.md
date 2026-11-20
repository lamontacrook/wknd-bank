# WKND Bank

A demo website for a fictional bank, WKND Bank. It's a Next.js App Router front end that renders AEM as a Cloud Service Content Fragments (CFs) and is editable in the AEM Universal Editor (UE).

- `PRODUCT.md`: who the site is for and how it should sound.
- `DESIGN.md` and `DESIGN.json`: the visual system. They are the source of truth for color, type, spacing and components.

Read all three before changing UI.

### Stardust prototype (visual reference)

The look and feel came from a Stardust redesign of the old WKND running site:

- `stardust/direction.md`: the redesign direction, i.e. why the site looks this way.
- `stardust/prototypes/index-proposed.html`: the approved home page prototype. It's a static, self-contained HTML file; open it in a browser.
- `stardust/prototypes/index-shape.md`: the prototype's section-by-section brief.

When you build a page, match the prototype's sections, order, spacing and responsive behavior. Implement it as the React components in the content model below, fed by Content Fragments. Never paste the prototype's HTML in. The prototype is a reference, not runtime code. If the prototype and `DESIGN.md` disagree, `DESIGN.md` wins.

## Commands

```sh
npm run dev          # local dev server (Turbopack)
npm run dev:https    # same over HTTPS (Universal Editor needs it); certs in certificates/ (gitignored)
npm run build        # production build; must pass before you commit
npm run lint         # ESLint
npm run aem:gen      # regenerate the query, mock and UE JSON from aem/demo.spec.json
npm run aem:check    # validate the spec; check the query against the schema and the mock
npm run aem:persist  # persist the query on AEM (needs AEM_HOST and AEM_TOKEN in your shell)
```

Use npm, not pnpm or yarn. Node 22+.

## Stack

- Next.js 16, App Router, React 19, TypeScript. `cacheComponents` is on: cache with `"use cache"` + `cacheLife()`, never route-level `revalidate`.
- Styling: CSS Modules colocated with each component, tokens and base styles in `app/globals.css`. No Tailwind.
- Imports use the `@/` alias for the repo root.
- AEM headless: persisted queries are plain `GET` requests (`lib/aem.ts`), so there is no client library.

## Files

| Path | What |
|---|---|
| `aem/demo.spec.json` | **Source of truth** for CF models, folders and sample content. Edit this, then `npm run aem:gen` |
| `aem/scripts/` | Generators and checks, copied from the `headless-demo` skill |
| `aem/screen-by-path.graphql` | Generated persisted query |
| `lib/mock/screen-home.json` | Generated mock with the exact query shape |
| `public/component-{definition,models,filters}.json` | Generated UE registration |
| `lib/aem.ts` | Query URL and fetch, shared by server and client |
| `lib/load-screen.ts` | Server-only cached loader with mock fallback |
| `lib/aue.ts` | `data-aue-*` helpers |
| `components/ScreenView.tsx` | Client view; re-reads from author inside UE |
| `components/ModelManager.tsx` | `_model.title` → component registry |
| `app/architecture/` | Presenter deck at `/architecture` (17 slides). Content and code snippets live in `slides.tsx`; keep snippets in sync with the real files. Per-model detail slides at `/architecture/model/<id>` are generated from `aem/demo.spec.json` |

## AEM environment

| What | Value |
|---|---|
| Author | `https://author-p124903-e1367755.adobeaemcloud.com` |
| Configuration | `/conf/wknd-bank` |
| CF models | `/conf/wknd-bank/settings/dam/cfm/models/*` (9 models) |
| Content root | `/content/dam/wknd-bank/site/en/{home,rates,products,disclosures}` |
| Home page fragment | `/content/dam/wknd-bank/site/en/home/home` (model: Screen) |
| Persisted query | `wknd-bank/screen-by-path` → `GET /graphql/execute.json/wknd-bank/screen-by-path;path=<fragment path>` |

Configuration comes from env vars. The public, non-secret defaults are committed in `.env`; override them in `.env.local` or the host's settings. Never commit tokens.

- `NEXT_PUBLIC_AEM_HOST`: AEM origin for content requests.
- `NEXT_PUBLIC_AEM_AUTHOR`: author origin for the UE connection. It's read at **build time**; without it the connection meta isn't rendered.
- `NEXT_PUBLIC_AEM_PROJECT`: the configuration name, `wknd-bank`.

When AEM isn't configured or a request fails, render the local mock (`lib/mock/screen-home.json`, same shape as the query result) so the demo always works. A badge in the corner shows the source: "Sample content", "AEM connected" or "AEM author".

### Content model

A page is a **Screen** fragment: `title`, `block` (an ordered list of section fragments) and `disclosures` (a list of Disclosure fragments). The section models map one-to-one to React components:

| CF model | Component | Notes |
|---|---|---|
| Screen | `SiteShell` | `<main>` plus the footer disclosures |
| Bank Hero | `BankHero` | `layout`: `split` or `stacked`; references Rate fragments |
| Rates Table | `RatesTable` | Ordered Rate references |
| Rate | `RateFigure` and table rows | `rate` is a number, `rateType` is APY or APR, `status` is sample or approved |
| Product List / Product Line | `ProductList` | `items` references Product Line |
| Feature Split | `FeatureSplit` | `mediaPosition`, `mobileOrder` and `background` drive responsive layout |
| Cta Band | `CtaBand` | `tone`: `spruce` or `ink`. `spruce` is a legacy enum key in AEM; it renders the primary brand color, harbor |
| Disclosure | Footer | Rich text owned by compliance |

Choose the component from `_model.title` through a single registry (`ModelManager`). Don't use `switch` statements scattered around the code. Every fragment in a query must return `_path`, `_variation` and `_model { title _path }`.

To change a model, edit `aem/demo.spec.json`, run `npm run aem:gen && npm run aem:check`, then change it in AEM and re-persist the query. A field rename doesn't migrate existing fragment values.

## Universal Editor rules

- `app/layout.tsx` renders `<meta name="urn:adobe:aue:system:aemconnection" content="aem:<author>">`, the three `<script>` tags for `/component-definition.json`, `/component-models.json` and `/component-filters.json` (in `public/`), and loads `https://universal-editor-service.adobe.io/cors.js`.
- Put the `data-aue-*` attributes in helpers in `lib/aue.ts`, never inline. A CF resource is `urn:aemconnection:<_path>/jcr:content/data/<_variation>`.
  - Each fragment-backed component root gets `data-aue-resource`, `data-aue-type="reference"` and `data-aue-label`.
  - Each editable field gets `data-aue-prop` and `data-aue-type` (`text`, `richtext`, `media`).
  - Multi-value fragment references get `data-aue-type="container"` and a `data-aue-filter`.
- Set `data-aue-model` only for models listed in `component-models.json` (the ones with enumerations: Bank Hero, Rate, Feature Split, Cta Band). Leave it out elsewhere so the properties panel follows the CF model.
- Site chrome (utility bar, header nav, footer link columns) is code, not content. The footer disclosures are the Screen's `disclosures` field, so they sit inside a wrapper carrying the Screen resource.
- Never make a number, date or enumeration inline-editable (e.g. `rate`). Edit those in the properties panel so they keep their types.
- UE loads the site in an iframe from author, so editable content must render client-side from author data with `credentials: "include"`. Don't cache author responses.

## Design rules

- Tokens (CSS variables in `app/globals.css`): harbor `#1d4a85`, harbor-deep `#102a4c`, ink `#0f1f36`, paper `#faf8f3`, mist `#ebf0f6`, brass `#e3b04b`, slate-muted `#4a5669`, hairline `#d5dde8`. Define them once as CSS variables or Tailwind theme values, and never use hex values ad hoc in components.
- Type: Source Serif 4 for display and Hanken Grotesk for body through `next/font/google`. Use `var(--font-display-stack)` and `var(--font-body-stack)`, which include fallbacks.
- Contrast is WCAG AA at minimum; `DESIGN.md` lists the pairings that pass. Brass is always paired with ink text.
- Responsive behavior lives in components and is driven by CF enumeration fields such as `layout` and `mobileOrder`, not by per-page overrides. Sections stack below 1024px.

## Banking content rules

- Rates, APY/APR values and disclosures are **placeholders** until compliance supplies them. Rates with `status: "sample"` must show a visible "Sample rate" label.
- Never invent regulatory claims such as Member FDIC, Equal Housing Lender or rate guarantees. Use the Disclosure fragments.
- Display rates with two decimals and the rate type (e.g. `4.25% APY`), plus the effective date where space allows.

## Working conventions

- Server Components are the default. Add `"use client"` only for interactivity or for content that UE must edit (author data).
- Keep components small, typed, and colocated with their `.module.css` under `components/`.
- Images go through `next/image`. Alt text comes from CF fields (`imageAlt`); an empty alt means the image is decorative.
- Don't commit secrets, `.env*.local`, or author tokens.
- Before you commit, `npm run lint` and `npm run build` must both pass.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
