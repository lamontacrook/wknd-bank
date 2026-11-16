#!/usr/bin/env node
// Prints the Sites OpenAPI payloads the AEM MCP server's write-api tool posts.
//   node openapi.mjs <spec> models     → { configurationFolder, batches: [[model...], ...] }  POST /adobe/sites/cf/models
//   node openapi.mjs <spec> folders    → [{ path, title }, ...]                                POST /adobe/folders
//   node openapi.mjs <spec> fragments  → [{ title, name, modelId, parentPath, fields }, ...]   POST /adobe/sites/cf/fragments (one at a time, in order)
// Model ids are the base64url of the model path, so references resolve before a model exists.
import { contentInOrder, isMain, loadSpec, modelBatches } from "./lib.mjs"

function field(s, f, m) {
  const base = { name: f.name, label: f.label, required: !!f.required, multiple: f.type === "fragments" }
  if (f.description) base.description = f.description
  switch (f.type) {
    case "text":
      return { ...base, type: "text", maxLength: f.maxLength || 255, translatable: true,
        ...(f.pattern
          ? { validationType: "custom", customValidationRegex: f.pattern, customErrorMessage: f.patternMessage || `Must match ${f.pattern}` }
          : { validationType: "none" }) }
    case "multiline":
      return { ...base, type: "long-text", mimeType: "text/html", allowFragmentReference: false, translatable: true }
    case "number":
      return { ...base, type: "float-number", ...(f.min !== undefined ? { min: f.min, customErrorMessage: `Must be ${f.min} or more` } : {}) }
    case "date":
      return { ...base, type: "date" }
    case "enum":
      return { ...base, type: "enumeration", hint: "select", values: f.options.map(([value, key]) => ({ key, value })),
        ...(f.default !== undefined ? { defaultValue: f.default } : {}) }
    case "image":
      return { ...base, type: "content-reference", root: s.damRoot, allowedContentTypes: ["image"], showThumbnail: true }
    case "fragment":
    case "fragments":
      return { ...base, type: "content-fragment", root: s.siteRoot, allowFragmentCreation: true, items: f.models.map(s.modelId) }
    default:
      throw new Error(`${m.id}.${f.name}: unknown type ${f.type}`)
  }
}

export const toModel = (s, m) => ({ name: m.title, technicalName: m.id, description: m.description, fields: m.fields.map((f) => field(s, f, m)) })

export const models = (s) => ({ configurationFolder: s.confPath, batches: modelBatches(s).map((b) => b.map((m) => toModel(s, m))) })

export function folders(s) {
  const out = [
    { path: s.damRoot, title: s.brand },
    { path: `${s.damRoot}/site`, title: "Site" },
    { path: s.siteRoot, title: s.locale.toUpperCase() },
  ]
  for (const [k, f] of Object.entries(s.folders)) out.push({ path: `${s.siteRoot}/${k}`, title: f.title || k })
  return out
}

export function fragments(s) {
  return contentInOrder(s).map((c) => {
    const m = s.modelById[c.model]
    const fields = []
    for (const f of m.fields) {
      const v = c.fields?.[f.name]
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) continue
      const values = f.type === "fragments" ? v.map(s.fragmentPath)
        : f.type === "fragment" ? [s.fragmentPath(v)]
        : f.type === "number" ? [Number(v)] : [v]
      fields.push({ name: f.name, type: field(s, f, m).type, multiple: f.type === "fragments", values,
        ...(f.type === "multiline" ? { mimeType: "text/html" } : {}) })
    }
    const full = s.fragmentPath(c.path)
    const parent = full.slice(0, full.lastIndexOf("/"))
    return { path: full, title: c.title, name: full.slice(full.lastIndexOf("/") + 1), modelId: s.modelId(m.id),
      parentPath: parent.slice("/content/dam".length), fields }
  })
}

if (isMain(import.meta.url)) {
  const s = loadSpec()
  const what = process.argv[3] || "models"
  const out = { models, folders, fragments }[what]
  if (!out) { console.error(`Unknown output "${what}": models | folders | fragments`); process.exit(1) }
  console.log(JSON.stringify(out(s), null, process.argv.includes("--pretty") ? 2 : 0))
}
