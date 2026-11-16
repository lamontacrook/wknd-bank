import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DeckKeys } from "../_deck/DeckKeys";
import { slides } from "../slides";
import s from "../_deck/deck.module.css";

export function generateStaticParams() {
  return slides.map((_, i) => ({ slide: String(i + 1) }));
}

function slideAt(param: string) {
  const index = Number(param);
  return Number.isInteger(index) && index >= 1 && index <= slides.length ? index : null;
}

export async function generateMetadata({ params }: PageProps<"/architecture/[slide]">): Promise<Metadata> {
  const index = slideAt((await params).slide);
  return { title: index ? `${slides[index - 1].title} · ${index}/${slides.length}` : "Slide not found" };
}

export default function SlidePage({ params }: PageProps<"/architecture/[slide]">) {
  return (
    <Suspense fallback={<div className={s.viewport} />}>
      <SlideView params={params} />
    </Suspense>
  );
}

async function SlideView({ params }: { params: PageProps<"/architecture/[slide]">["params"] }) {
  const index = slideAt((await params).slide);
  if (!index) notFound();
  const slide = slides[index - 1];
  const total = slides.length;

  return (
    <div className={s.viewport}>
      <main id="main" className={s.slide} data-tone={slide.tone} aria-roledescription="slide" aria-label={`${index} of ${total}`}>
        {slide.cover ? (
          <div className={`${s.body} ${s.cover}`} style={{ gridRow: "1 / 3" }}>
            {slide.body}
          </div>
        ) : (
          <>
            <header className={s.head}>
              <h1>{slide.title}</h1>
              {slide.lede && <p>{slide.lede}</p>}
            </header>
            <div className={s.body}>{slide.body}</div>
          </>
        )}
        <footer className={s.foot}>
          <Link className={s.brand} href="/architecture">
            WKND Bank · Universal Editor on AEM headless
          </Link>
          <nav className={s.nav} aria-label="Slides">
            <Link className={s.navBtn} href={`/architecture/${index - 1}`} aria-disabled={index === 1} tabIndex={index === 1 ? -1 : undefined} aria-label="Previous slide">
              ←
            </Link>
            <span className={s.count}>
              {index} / {total}
            </span>
            <Link className={s.navBtn} href={`/architecture/${index + 1}`} aria-disabled={index === total} tabIndex={index === total ? -1 : undefined} aria-label="Next slide">
              →
            </Link>
          </nav>
        </footer>
        <span className={s.progress} style={{ transform: `scaleX(${index / total})` }} aria-hidden />
      </main>
      <DeckKeys index={index} total={total} />
    </div>
  );
}
