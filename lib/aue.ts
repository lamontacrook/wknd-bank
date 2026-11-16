import type { Fragment } from "./types";

// Must match the suffix of the urn:adobe:aue:system:<name> meta tag in app/layout.tsx.
export const AUE_CONNECTION = "aemconnection";

type Attrs = Record<string, string>;

export const cfResource = (item?: Fragment | null) =>
  item?._path ? `urn:${AUE_CONNECTION}:${item._path}/jcr:content/data/${item._variation || "master"}` : undefined;

export function aueFragment(
  item: Fragment | null | undefined,
  { label, model, filter, type = "reference" }: { label?: string; model?: string; filter?: string; type?: string } = {},
): Attrs {
  const resource = cfResource(item);
  if (!resource) return {};
  return {
    "data-aue-resource": resource,
    "data-aue-type": type,
    "data-aue-label": label || item?._model?.title || "Fragment",
    ...(model ? { "data-aue-model": model } : {}),
    ...(filter ? { "data-aue-filter": filter } : {}),
  };
}

export const aueProp = (prop: string, type: "text" | "richtext" | "media" = "text", label?: string): Attrs => ({
  "data-aue-prop": prop,
  "data-aue-type": type,
  "data-aue-label": label || prop,
});

export const aueContainer = (prop: string, { label, filter }: { label?: string; filter?: string } = {}): Attrs => ({
  "data-aue-prop": prop,
  "data-aue-type": "container",
  "data-aue-label": label || prop,
  ...(filter ? { "data-aue-filter": filter } : {}),
});
