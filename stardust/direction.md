<!-- stardust:provenance writtenBy=stardust:direct at=2026-11-13T15:50:00Z -->
# Direction — WKND Bank

> **Palette revision (2026-11-16):** at the client's request, the primary color moved from spruce green to harbor navy (`#1d4a85`, deep `#102a4c`). The green-tinted neutrals were cooled to match. `DESIGN.md` has the current tokens; the green references below are historical.


## Phrase
"create a new look and feel for this site … this will be for a bank" + user choice: "Fictional retail bank, trustworthy-modern (e.g. "WKND Bank")".

## Restatement
Rebrand the WKND running storefront into a retail bank: register `brand`; tone serious→calm-confident; expressive restrained→committed (serif figures); distinctiveness familiar→distinctive within category (spruce not navy); audience retail banking customers.

## Movements
- register: brand (inherited)
- tone: calm, plain-spoken, trustworthy
- expressive: committed (ratio 1.25)
- density: balanced (autopilot assumption — brand-register default; user not asked)
- ia-fidelity: reimagined (autopilot assumption — bank IA replaces retail IA)
- audience: retail banking customers + AEM authors

## Mode
Rebrand mode active — full divergence resolution. Mode A bypassed because the user asked for a new bank brand and the captured surface is signal-thin (chrome only; content gated behind AEM config modal).

## Divergence inputs
See `DESIGN.json#extensions.divergence`. Palette: spruce/paper/brass (AA-verified). Type: Source Serif 4 + Hanken Grotesk. Reference research: not run live (named assumption — category conventions from agent knowledge).

## Commands proposed
`$stardust prototype home` → impeccable craft (shape → build) → critique/audit/adapt gates → apply to Next.js components (out-of-stardust step: the Next.js app is the delivery target, not EDS).

## Named deviations
- Delivery target is the existing Next.js app (not `migrate`/`deploy` to EDS). The approved prototype is translated by hand into React components + CSS tokens instead of the migrate pipeline, because the user's goal is a Universal Editor demo on Next.js.

## Confirmation
Plan approved by user (session plan, 2026-11-13).

## Pages in scope content (direction-authorized, verbatim)
User-authorized fictional brand ("WKND Bank"). Allowed literal copy for `index`:
- Utility: "Personal" · "Business" · "Help & support" · "Find a branch"
- Nav: "Checking" · "Savings" · "Credit cards" · "Home loans" · "Sign in" · CTA "Open an account"
- Hero H1: "Banking that shows its work." Sub: "Clear rates, plain fees, and people who answer. Open a WKND checking account in about ten minutes." CTA "Open an account" / link "Compare accounts"
- Rates H2: "Today's rates" (all figures are PLACEHOLDER · price — never invent APYs)
- Products H2: "Accounts for how you actually live" — Checking: "No monthly fee when you set up direct deposit." Savings: "Earn more on money you're not touching." Credit cards: "Cash back without the fine print." Home loans: "Talk to a lender, not a call tree."
- Feature H2: "Know where every dollar went." body: "Spending insights, instant alerts, and card lock live in one app. Freeze a lost card in a tap; unfreeze it when it turns up in the couch."
- CTA band H2: "Ready when you are." CTA "Open an account"
- Footer disclosure: "WKND Bank is a fictional bank for demonstration purposes. Member FDIC-style disclosure placeholder." (regulatory text is PLACEHOLDER · other)
