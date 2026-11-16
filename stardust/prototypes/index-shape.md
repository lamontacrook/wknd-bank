<!-- stardust:provenance
  writtenBy: stardust:prototype/shape
  page: index
  pageUrl: https://wknd-running.vercel.app/
  againstDirection: stardust/direction.md
  consumedBy: impeccable:craft
  readArtifacts: [stardust/current/pages/index.json, stardust/current/_brand-extraction.json, DESIGN.md, DESIGN.json, stardust/direction.md]
-->
---
slug: index
url: https://wknd-running.vercel.app/
register: brand
surprise: medium
fidelity: quick
---
# Page shape: index (WKND Bank home)

## Sections (render order)
1. **utility-bar** (system role `utility-bar`) — direction-authorized new (audience-routing iaPriority). spruce-deep, lichen text. H: none.
2. **header** (system role `header`) — site-wide system-component carried from `_brand-extraction.json#systemComponents[kind=header]` (logo + nav) re-labelled per direction. Sticky, paper ground, hairline bottom. Wordmark "WKND Bank" in Source Serif 4.
3. **hero** (`data-section=hero data-intent=convert data-layout=split`) — derived from captured hero slot (`pages/index.json` — gated, empty) + direction. Split: left H1 + sub + one pill CTA + text link; right **rate ledger card** (signature rate-tile set) instead of stock photo. H1 once.
4. **rates** (`data-intent=inform data-layout=ledger`) — direction-authorized new (Number Leads rule). Statement-style table: product · APY/APR (PLACEHOLDER · price) · term · disclosure link. H2.
5. **products** (`data-intent=browse data-layout=list-4`) — derived from captured category-grid/product-collection component (retail cards → account offers). 4 rows as numbered ledger entries, not image cards. H2 + H3s.
6. **feature** (`data-intent=explain data-layout=split-media`) — direction-authorized new (app/trust). Mist substrate. H2.
7. **cta-band** (system role `cta-band`) — spruce substrate, one brass button. H2.
8. **footer** (system role `footer`) — carried from `_brand-extraction.json#systemComponents[kind=footer]`; spruce-deep, IA columns + disclosure (PLACEHOLDER · other).

## antiTemplatePass
- hero: reflex centered-stack two-button → alternatives (full-bleed photo w/ overlay; split H1 + rate ledger; type-only) → picked split + rate ledger (Number Leads).
- products: reflex 4-up image cards → alternatives (icon cards; numbered ledger rows; tabs) → picked numbered ledger rows (statement-print craft seed).
- cta-band: reflex gradient band → picked flat spruce with single brass CTA (One Brass Rule).
- nav glyphs: no icon glyphs; text "Sign in".

## surprise: medium
Move: typographic substitution — product grid replaced by statement-ledger rows with serif figures.

## substrateTransitions
default paper; exceptions: [feature → mist ("app moment"), cta-band → spruce ("conversion moment")]. (utility/footer chrome are system roles.)

## voiceClassification
All copy = direction-authorized rewrite (direction.md § Pages in scope content). Rates, disclosure = placeholder.

## unsourcedContent
- hero rate ledger figures (price) · rates table figures (price) · footer regulatory line (other).

## Responsive
≤640: hamburger nav (stock pattern), hero stacks (ledger below), rates table → stacked rows; 768: 2-col products; ≥1024 full split.
