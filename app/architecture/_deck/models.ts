import spec from "@/aem/demo.spec.json";
import { AEM_AUTHOR } from "@/lib/aem";

export type Field = {
  name: string;
  label: string;
  type: "text" | "multiline" | "number" | "date" | "enum" | "image" | "fragment" | "fragments";
  required?: boolean;
  maxLength?: number;
  min?: number;
  pattern?: string;
  options?: string[][];
  models?: string[];
  description?: string;
};

export type Model = { id: string; title: string; description: string; folder: string; fields: Field[] };

export const models = spec.models as Model[];

const byId = new Map(models.map((m) => [m.id, m]));
export const modelById = (id: string) => byId.get(id);

export const modelHref = (id: string) => `/architecture/model/${id}`;

/** Same derivation as aem/scripts/lib.mjs. */
export const modelPath = (id: string) => `/conf/${spec.conf}/settings/dam/cfm/models/${id}`;
export const folderPath = (folder: string) => `/content/dam/${spec.conf}/site/${spec.locale}/${folder}`;

/** The model in AEM's Content Fragment Model editor on author; null when no author is configured. */
export const aemModelUrl = (id: string) =>
  AEM_AUTHOR ? `${AEM_AUTHOR}/mnt/overlay/dam/cfm/models/editor/content/editor.html${modelPath(id)}` : null;

/** Every model field that can hold a fragment of this model. */
export const referrers = (id: string) =>
  models.flatMap((m) => m.fields.filter((f) => f.models?.includes(id)).map((f) => ({ model: m, field: f })));
