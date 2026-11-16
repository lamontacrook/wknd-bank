#!/usr/bin/env node
// Validates a demo spec against AEM, GraphQL and Universal Editor rules.
//   node validate.mjs aem/demo.spec.json
import { FIELD_TYPES, contentInOrder, isMain, loadSpec, modelBatches, typeName } from "./lib.mjs"

export function validate(s) {
  const errors = []
  const warn = []
  const err = (m) => errors.push(m)

  if (!/^[a-z][a-z0-9-]{1,40}$/.test(s.conf || "")) err(`conf "${s.conf}": lower-case letters, digits and dashes`)
  if (!s.brand) err("brand is required")
  if (!s.root?.model || !s.root?.path) err("root.model and root.path are required")
  if (s.root?.queryName && !/^[a-z][a-z0-9-]*$/.test(s.root.queryName)) err(`root.queryName "${s.root.queryName}": kebab-case`)

  const ids = new Set()
  const types = new Set()
  for (const m of s.models || []) {
    const at = `model ${m.id}`
    if (!/^[a-z][a-z0-9-]*$/.test(m.id)) err(`${at}: id must be kebab-case`)
    if (ids.has(m.id)) err(`${at}: duplicate id`)
    ids.add(m.id)
    if (!/^[A-Z][a-z0-9]*( [A-Z][a-z0-9]*)*$/.test(m.title || ""))
      err(`${at}: title "${m.title}" must be Title Case words without acronyms in capitals (e.g. "Cta Band"), so the GraphQL type name is predictable`)
    if (types.has(typeName(m))) err(`${at}: GraphQL type ${typeName(m)} collides with another model`)
    types.add(typeName(m))
    if (!s.folders?.[m.folder]) err(`${at}: folder "${m.folder}" is not in folders`)
    if (!m.fields?.length) err(`${at}: no fields`)
    const names = new Set()
    for (const f of m.fields || []) {
      const fa = `${at}.${f.name}`
      if (!/^[a-z][a-zA-Z0-9]*$/.test(f.name)) err(`${fa}: field names are camelCase letters and digits (no "_" or "-": UE binds them with data-aue-prop)`)
      if (names.has(f.name)) err(`${fa}: duplicate field`)
      names.add(f.name)
      if (!FIELD_TYPES.includes(f.type)) err(`${fa}: type "${f.type}" not in ${FIELD_TYPES.join(", ")}`)
      if (!f.label) err(`${fa}: label is required`)
      if (f.type === "enum") {
        if (!Array.isArray(f.options) || !f.options.length) err(`${fa}: enum needs options [[value, label], ...]`)
        else if (f.default !== undefined && !f.options.some(([v]) => v === f.default)) err(`${fa}: default "${f.default}" is not an option`)
      }
      if (f.type === "fragment" || f.type === "fragments") {
        if (!f.models?.length) err(`${fa}: reference fields need models: [...]`)
        for (const r of f.models || []) if (!s.models.some((x) => x.id === r)) err(`${fa}: references unknown model "${r}"`)
      }
      if (f.pattern) try { new RegExp(f.pattern) } catch { err(`${fa}: invalid pattern`) }
    }
  }
  for (const [k, folder] of Object.entries(s.folders || {})) {
    if (!/^[a-z][a-z0-9-]*$/.test(k)) err(`folder "${k}": kebab-case`)
    for (const id of folder.models || []) if (!ids.has(id)) err(`folder ${k}: unknown model "${id}"`)
  }
  try { modelBatches(s) } catch (e) { err(e.message) }

  const paths = new Set()
  for (const c of s.content || []) {
    const at = `content ${c.path}`
    if (paths.has(c.path)) err(`${at}: duplicate path`)
    paths.add(c.path)
    if (!/^[a-z0-9-]+(\/[a-z0-9-]+)+$/.test(c.path)) err(`${at}: path is "<folder>/<name>" in kebab-case, relative to the site root`)
    const folder = c.path.split("/")[0]
    const m = s.modelById[c.model]
    if (!m) { err(`${at}: unknown model "${c.model}"`); continue }
    if (!s.folders?.[folder]) err(`${at}: folder "${folder}" is not in folders`)
    else if (!s.folders[folder].models.includes(m.id)) err(`${at}: model ${m.id} is not allowed in folder ${folder}`)
    if (!c.title) err(`${at}: title is required`)
    for (const k of Object.keys(c.fields || {})) if (!m.fields.some((f) => f.name === k)) err(`${at}: field "${k}" is not in model ${m.id}`)
    for (const f of m.fields) {
      const v = c.fields?.[f.name]
      const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)
      if (empty) { if (f.required) err(`${at}: required field ${f.name} is empty`); continue }
      if (f.type === "text" && typeof v !== "string") err(`${at}.${f.name}: text must be a string`)
      if (f.type === "text" && f.maxLength && v.length > f.maxLength) err(`${at}.${f.name}: ${v.length} chars > maxLength ${f.maxLength}`)
      if (f.type === "text" && f.pattern && !new RegExp(f.pattern).test(v)) err(`${at}.${f.name}: does not match ${f.pattern}`)
      if (f.type === "multiline" && typeof v !== "string") err(`${at}.${f.name}: multiline must be an HTML string`)
      if (f.type === "number" && typeof v !== "number") err(`${at}.${f.name}: must be a number`)
      if (f.type === "number" && f.min !== undefined && v < f.min) err(`${at}.${f.name}: below min ${f.min}`)
      if (f.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(v)) err(`${at}.${f.name}: date is YYYY-MM-DD`)
      if (f.type === "enum" && !f.options.some(([o]) => o === v)) err(`${at}.${f.name}: "${v}" is not an option`)
      if (f.type === "image" && !String(v).startsWith("/content/dam/")) err(`${at}.${f.name}: image is a /content/dam/... asset path`)
      if (f.type === "image") warn.push(`${at}.${f.name}: ${v} must exist in Assets before the fragment is created`)
      const refs = f.type === "fragment" ? [v] : f.type === "fragments" ? v : []
      if (f.type === "fragments" && !Array.isArray(v)) err(`${at}.${f.name}: fragments must be an array of paths`)
      for (const r of refs) {
        const t = s.content.find((x) => x.path === r)
        if (!t) err(`${at}.${f.name}: references missing content "${r}"`)
        else if (!f.models.includes(t.model)) err(`${at}.${f.name}: "${r}" is a ${t.model}, allowed: ${f.models.join(", ")}`)
      }
    }
  }
  const root = s.content?.find((c) => c.path === s.root?.path)
  if (!root) err(`root.path "${s.root?.path}" is not in content`)
  else if (root.model !== s.root.model) err(`root.path is a ${root.model}, not ${s.root.model}`)
  try { contentInOrder(s) } catch (e) { err(e.message) }
  const unused = s.models.filter((m) => !s.content.some((c) => c.model === m.id)).map((m) => m.id)
  if (unused.length) warn.push(`models without sample content: ${unused.join(", ")}`)
  return { errors, warnings: warn }
}

if (isMain(import.meta.url)) {
  const s = loadSpec()
  const { errors, warnings } = validate(s)
  warnings.forEach((w) => console.warn(`! ${w}`))
  if (errors.length) {
    errors.forEach((e) => console.error(`✗ ${e}`))
    process.exit(1)
  }
  console.log(`✓ ${s.brand}: ${s.models.length} models, ${s.content.length} fragments, ${Object.keys(s.folders).length} folders`)
}
