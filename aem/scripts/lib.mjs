// Shared helpers for a headless demo spec (see references/spec-format.md).
// No dependencies; Node 20+.
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

export const FIELD_TYPES = ["text", "multiline", "number", "date", "enum", "image", "fragment", "fragments"]

export function loadSpec(file = process.argv[2]) {
  if (!file) {
    console.error("Pass the spec path, e.g. aem/demo.spec.json")
    process.exit(1)
  }
  const spec = JSON.parse(readFileSync(resolve(file), "utf8"))
  return derive(spec)
}

export function derive(spec) {
  const locale = spec.locale || "en"
  const confPath = `/conf/${spec.conf}`
  const modelsPath = `${confPath}/settings/dam/cfm/models`
  const damRoot = `/content/dam/${spec.conf}`
  const siteRoot = `${damRoot}/site/${locale}`
  const modelById = Object.fromEntries(spec.models.map((m) => [m.id, m]))
  return {
    ...spec,
    locale,
    confPath,
    modelsPath,
    damRoot,
    siteRoot,
    modelById,
    modelPath: (id) => `${modelsPath}/${id}`,
    modelId: (id) => Buffer.from(`${modelsPath}/${id}`).toString("base64url"),
    fragmentPath: (rel) => `${siteRoot}/${rel}`,
  }
}

// AEM GraphQL naming: model title without spaces → <Title>Model and <title>ByPath.
export const typeName = (m) => `${m.title.replace(/ /g, "")}Model`
export const byPathField = (m) => {
  const t = m.title.replace(/ /g, "")
  return `${t[0].toLowerCase()}${t.slice(1)}ByPath`
}
export const listField = (m) => byPathField(m).replace(/ByPath$/, "List")

// Fragments sorted so every referenced fragment comes before the fragment that references it.
export function contentInOrder(s) {
  const byPath = new Map(s.content.map((c) => [c.path, c]))
  const refs = (c) => {
    const m = s.modelById[c.model]
    return m.fields.flatMap((f) => {
      const v = c.fields?.[f.name]
      if (f.type === "fragment" && v) return [v]
      if (f.type === "fragments" && Array.isArray(v)) return v
      return []
    })
  }
  const out = []
  const state = new Map()
  const visit = (p, trail) => {
    if (state.get(p) === "done") return
    if (state.get(p) === "visiting") throw new Error(`circular fragment references: ${[...trail, p].join(" → ")}`)
    state.set(p, "visiting")
    const c = byPath.get(p)
    if (c) refs(c).forEach((r) => visit(r, [...trail, p]))
    state.set(p, "done")
    if (c) out.push(c)
  }
  s.content.forEach((c) => visit(c.path, []))
  return out
}

// Models sorted into batches: each batch references only models in earlier batches.
export function modelBatches(s) {
  const deps = (m) => m.fields.flatMap((f) => f.models || []).filter((d) => d !== m.id)
  const done = new Set()
  const out = []
  while (done.size < s.models.length) {
    const next = s.models.filter((m) => !done.has(m.id) && deps(m).every((d) => done.has(d)))
    if (!next.length) throw new Error("circular model references (a model may only reference itself)")
    next.forEach((m) => done.add(m.id))
    out.push(next)
  }
  return out
}

export const isMain = (url) => url === `file://${process.argv[1]}`
