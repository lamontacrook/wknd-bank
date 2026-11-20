import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ModelDetail } from "../../_deck/ContentModel";
import { ModelKeys } from "../../_deck/ModelKeys";
import { aemModelUrl, folderPath, modelById, modelHref, models } from "../../_deck/models";
import { slideNumber } from "../../slides";
import s from "../../_deck/deck.module.css";
import { UeLink } from "../../_deck/UeLink";

export function generateStaticParams() {
  return models.map((m) => ({ model: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/architecture/model/[model]">): Promise<Metadata> {
  const model = modelById((await params).model);
  return { title: model ? `${model.title} model · Content model` : "Model not found" };
}

export default function ModelPage({ params }: PageProps<"/architecture/model/[model]">) {
  return (
    <Suspense fallback={<div className={s.viewport} />}>
      <ModelView params={params} />
    </Suspense>
  );
}

async function ModelView({ params }: { params: PageProps<"/architecture/model/[model]">["params"] }) {
  const model = modelById((await params).model);
  if (!model) notFound();
  const i = models.indexOf(model);
  const prev = models[i - 1];
  const next = models[i + 1];
  const back = `/architecture/${slideNumber("models")}`;
  const aem = aemModelUrl(model.id);

  return (
    <div className={s.viewport}>
      <main id="main" className={s.slide} aria-roledescription="slide" aria-label={`${model.title} model, ${i + 1} of ${models.length}`}>
        <header className={s.head}>
          <h1>{model.title}</h1>
          <p>{model.description}.</p>
        </header>
        <div className={s.body}>
          <ModelDetail model={model} />
          <p className={s.modelBar}>
            {aem && (
              <a className={s.aemLink} href={aem} target="_blank" rel="noopener noreferrer">
                Open the model in AEM <span aria-hidden>↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <span>
              Fragments live in <code>{folderPath(model.folder)}</code>
            </span>
          </p>
        </div>
        <footer className={s.foot}>
          <span className={s.footStart}>
            <Link className={s.backLink} href={back}>
              ← All nine models
            </Link>
            <Link className={s.brand} href="/architecture">
              WKND Bank · Universal Editor on AEM headless
            </Link>
            <UeLink />
          </span>
          <nav className={s.nav} aria-label="Models">
            <Link className={s.navBtn} href={prev ? modelHref(prev.id) : back} aria-disabled={!prev} tabIndex={prev ? undefined : -1} aria-label={prev ? `Previous model: ${prev.title}` : "Previous model"}>
              ←
            </Link>
            <span className={s.count}>
              Model {i + 1} / {models.length}
            </span>
            <Link className={s.navBtn} href={next ? modelHref(next.id) : back} aria-disabled={!next} tabIndex={next ? undefined : -1} aria-label={next ? `Next model: ${next.title}` : "Next model"}>
              →
            </Link>
          </nav>
        </footer>
      </main>
      <ModelKeys prev={prev && modelHref(prev.id)} next={next && modelHref(next.id)} back={back} />
    </div>
  );
}
