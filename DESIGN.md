---
name: WKND Bank
description: Trustworthy-modern retail bank — spruce, paper and brass
colors:
  ink: "#10282b"
  spruce: "#0e4f4a"
  spruce-deep: "#0a3835"
  paper: "#faf8f3"
  mist: "#edf2ef"
  brass: "#e3b04b"
  slate-muted: "#4a5d5b"
  hairline: "#d6dfdb"
  lichen-on-dark: "#b9cdc8"
typography:
  display:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
  title:
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  figure:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "clamp(2.5rem, 4vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1
  label:
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section-desktop: "64px"
  section-tablet: "48px"
  section-mobile: "32px"
components:
  button-primary:
    backgroundColor: "{colors.spruce}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.spruce-deep}"
  button-accent:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.spruce}"
    rounded: "{rounded.pill}"
    padding: "13px 27px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "48px"
  badge:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.spruce}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
---
<!-- stardust:provenance writtenBy=stardust:direct mode=rebrand read="PRODUCT.md,stardust/direction.md" -->
# Design System: WKND Bank

## Overview
A calm, paper-toned bank that reads like a well-set statement: serif figures for the numbers that matter, a sturdy grotesk for everything you act on, and a single brass accent reserved for the one action per section. Spruce green carries trust; the warm paper ground keeps it from feeling institutional.

## Colors
### Primary
**Spruce** (#0e4f4a): primary buttons, links, brand bands. **Spruce deep** (#0a3835): hero and footer grounds, hover state.
### Secondary
**Brass** (#e3b04b): accent CTA on dark grounds and the rate highlight. Always paired with ink text (7.8:1).
### Neutral
**Paper** (#faf8f3) page ground; **Mist** (#edf2ef) alternate section surface; **Ink** (#10282b) body text (14.5:1 on paper); **Slate muted** (#4a5d5b) secondary text (6.6:1); **Hairline** (#d6dfdb) borders; **Lichen** (#b9cdc8) secondary text on spruce-deep (7.8:1).
### Named Rules
**The One Brass Rule.** At most one brass element per section — it marks the decision.
**The No Grey Fine-Print Rule.** Disclosures use slate-muted at ≥14px, never lighter.

## Typography
Source Serif 4 (display, headline, figures) with Hanken Grotesk (titles, body, labels, controls). Ratio ≈1.25 (committed).
### Hierarchy
display → headline → title → body → label (uppercase, tracked). Figures (rates, APYs) use serif at display-adjacent size with tabular numerals.
### Named Rules
**The Number Leads Rule.** A rate or fee is set larger than the sentence that explains it.

## Layout
12-column grid, 1200px max content width, 24px gutters. Section padding 64/48/32px (desktop/tablet/mobile). Breakpoints: 640, 768, 1024, 1280. Cards stack to one column under 768px; two columns 768–1023; three or four above.

## Elevation & Depth
Flat by default. Cards use a hairline border; on hover a soft shadow (0 8px 24px oklch(0.25 0.03 190 / 0.08)). No glass, no gradients on text.

## Shapes
Pill buttons and badges; 12px card radius; 6px inputs. Photography cropped to 4:3 or 16:9 with 12px radius.

## Components
### Buttons
Pill, 48px tall, grotesk 600. Primary spruce on paper; accent brass on spruce-deep; secondary outlined spruce. Focus: 3px brass ring offset 2px.
### Cards / Containers
Paper card, hairline border, 24px padding, title + body + text link.
### Inputs / Fields
48px, hairline border, spruce 2px border on focus.
### Navigation
Utility bar (Personal · Business · Wealth · Locations · Help) in spruce-deep, main nav on paper with wordmark, primary links, Sign in (secondary) and Open an account (primary).
### Rate tile (signature)
Label (uppercase), serif figure with unit (e.g. “4.10% APY”), one-line qualifier, disclosure link.

## Do's and Don'ts
### Do:
- Put the rate in the headline position of a product card.
- Use one primary action per section.
### Don't:
- Use pure black/white, gradient text, glassmorphism or side-stripe accents.
- Use urgency copy or countdowns.
