#!/usr/bin/env node
// Writes the Universal Editor registration files for a Content Fragment–backed app.
//   node ue.mjs <spec> <outDir>   (e.g. public/)
//     component-definition.json  one component per model (except the root), backed by its CF model and folder
//     component-models.json      properties-panel forms, only for models with enum fields (to render a select).
//                                Other components follow their CF model. A UE model replaces the CF form, so it lists
//                                every editable scalar field; reference fields are edited as containers.
//     component-filters.json     one filter per multi-reference field: id "<model>-<field>", lists its allowed models
// In the app: a container element for a multi-reference field carries
//   data-aue-type="container" data-aue-prop="<field>" data-aue-filter="<model>-<field>"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { isMain, loadSpec } from "./lib.mjs"

const COMPONENT = { text: "text", multiline: "richtext", number: "number", date: "date-time", enum: "select", image: "reference" }
const VALUE = { number: "number", date: "date" }
const needsModel = (m) => m.fields.some((f) => f.type === "enum")

export const filterId = (m, f) => `${m.id}-${f.name}`

export function definition(s) {
  const components = s.models.filter((m) => m.id !== s.root.model).map((m) => ({
    title: m.title,
    id: m.id,
    plugins: { aem: { cf: { name: m.id, cfModel: s.modelPath(m.id), title: m.title, ...(m.description ? { description: m.description } : {}),
      cfFolder: `${s.siteRoot}/${m.folder}` } } },
    ...(needsModel(m) ? { model: m.id } : {}),
  }))
  return { groups: [{ title: s.brand, id: s.conf, components }] }
}

export function models(s) {
  return s.models.filter((m) => m.id !== s.root.model && needsModel(m)).map((m) => ({
    id: m.id,
    fields: m.fields.filter((f) => COMPONENT[f.type]).map((f) => ({
      component: COMPONENT[f.type],
      name: f.name,
      label: f.label,
      valueType: VALUE[f.type] || "string",
      ...(f.required ? { required: true } : {}),
      ...(f.description ? { description: f.description } : {}),
      ...(f.type === "image" ? { multi: false } : {}),
      ...(f.type === "enum" ? { options: f.options.map(([value, name]) => ({ name, value })), ...(f.default !== undefined ? { value: f.default } : {}) } : {}),
    })),
  }))
}

export function filters(s) {
  return s.models.flatMap((m) => m.fields.filter((f) => f.type === "fragments").map((f) => ({ id: filterId(m, f), components: f.models })))
}

if (isMain(import.meta.url)) {
  const s = loadSpec()
  const out = process.argv[3]
  if (!out) { console.error("Pass the output directory, e.g. public/"); process.exit(1) }
  mkdirSync(out, { recursive: true })
  for (const [file, data] of [["component-definition.json", definition(s)], ["component-models.json", models(s)], ["component-filters.json", filters(s)]]) {
    writeFileSync(join(out, file), JSON.stringify(data, null, 2) + "\n")
    console.log(`wrote ${join(out, file)}`)
  }
}
