<!-- stardust:provenance writtenBy=stardust:direct input="new look and feel … this will be for a bank; user pick: fictional retail bank, trustworthy-modern (WKND Bank)" mode=rebrand synthesized="audience, positioning, principles" read="stardust/current/PRODUCT.md,stardust/current/_brand-extraction.json" -->
# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
<!-- _provenance: inferred — fictional demo bank; audience derived from the retail-bank category -->
Everyday retail-banking customers (salaried adults, young families, small-business owners) comparing checking, savings, cards and home loans, mostly on mobile; plus the bank's marketing authors who assemble pages in AEM Universal Editor.

## Product Purpose
WKND Bank helps people open accounts and make money decisions with confidence. Scope: a public marketing site (home, product landing pages) composed from authorable AEM Content Fragment components in a Next.js runtime.

## Positioning
<!-- _provenance: inferred — fictional brand -->
A neighbourhood bank with modern tooling: plain-spoken rates up front, no fine-print theatre.

## Capabilities and Constraints
- Every content block is a Content Fragment rendered by a React component and editable in Universal Editor; components must stay composable in any order.
- Rates and fees are content, never hard-coded; disclosures must be authorable.
- WCAG 2.2 AA minimum (regulated financial content).

## Brand Commitments
- Register: `brand`.
- Personality: trustworthy, plain-spoken, calm, quietly confident, transactional where it matters (rates, CTAs).
- Anti-references: generic 2026 SaaS silhouette (purple gradients, glassmorphism, floating 3D blobs); stock "handshake" imagery; casino-style urgency; fine-print grey-on-grey disclosures.

## Evidence on Hand
- Current site captured as chrome only (`stardust/current/`); no bank copy, rates or imagery exist. All bank copy in prototypes is demo content and must be labelled as sample data; never present invented rates as real offers.

## Product Principles
- **Lead with the number.** Rates, fees and terms appear at headline scale, not in footnotes.
- **One decision per section.** Each block asks for one action.
- **Calm over urgent.** No countdowns, no scarcity copy.
- **Authorable by default.** Any visible string is a field an author can change in Universal Editor.

## Accessibility & Inclusion
AA contrast on every text/ground pair (verified), visible focus rings, 44px minimum touch targets, disclosures at ≥14px.
