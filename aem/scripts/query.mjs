#!/usr/bin/env node
// Generates the persisted query for the root model and a mock of its result from the sample content.
// Both walk the same selection, so the mock always has the exact shape the query returns.
//   node query.mjs <spec> query  > aem/<queryName>.graphql
//   node query.mjs <spec> mock   > lib/mock/<root>.json        (what data.<root>ByPath.item returns)
//
// References are expanded recursively with an inline fragment per allowed model. A model already
// being expanded higher up the same branch is cut to `_path _model { title }` to stop cycles.
import { byPathField, isMain, loadSpec, typeName } from "./lib.mjs"

const META = "_path _variation _model { title _path }"

function selection(s, m, ancestry, indent) {
  const pad = "  ".repeat(indent)
  const lines = [pad + META]
  for (const f of m.fields) {
    if (f.type === "multiline") lines.push(`${pad}${f.name} { html plaintext }`)
    else if (f.type === "image") lines.push(`${pad}${f.name} { ... on ImageRef { _path _authorUrl _publishUrl } }`)
    else if (f.type === "fragment" || f.type === "fragments") {
      lines.push(`${pad}${f.name} {`)
      for (const id of f.models) {
        const r = s.modelById[id]
        if (ancestry.includes(id)) lines.push(`${pad}  ... on ${typeName(r)} { _path _model { title } }`)
        else {
          lines.push(`${pad}  ... on ${typeName(r)} {`)
          lines.push(selection(s, r, [...ancestry, id], indent + 2))
          lines.push(`${pad}  }`)
        }
      }
      lines.push(`${pad}}`)
    } else lines.push(pad + f.name)
  }
  return lines.join("\n")
}

export function query(s) {
  const m = s.modelById[s.root.model]
  const name = byPathField(m)
  return `# ${s.brand}: persisted as ${s.conf}/${s.root.queryName || "page-by-path"}
#   GET /graphql/execute.json/${s.conf}/${s.root.queryName || "page-by-path"};path=${s.fragmentPath(s.root.path)}
# Generated from the demo spec. Every fragment returns _path, _variation and _model: the app builds
# Universal Editor URNs from _path/_variation and picks the React component from _model.title.

query ${name}($path: String!, $variation: String = "master") {
  ${name}(_path: $path, variation: $variation) {
    item {
${selection(s, m, [m.id], 3)}
    }
  }
}
`
}

function resolve(s, c, ancestry) {
  const m = s.modelById[c.model]
  const out = { _path: s.fragmentPath(c.path), _variation: "master", _model: { title: m.title, _path: s.modelPath(m.id) } }
  const ref = (p) => {
    const t = s.content.find((x) => x.path === p)
    const tm = s.modelById[t.model]
    return ancestry.includes(tm.id) ? { _path: s.fragmentPath(p), _model: { title: tm.title } } : resolve(s, t, [...ancestry, tm.id])
  }
  for (const f of m.fields) {
    const v = c.fields?.[f.name]
    const empty = v === undefined || v === null || v === ""
    if (f.type === "multiline") out[f.name] = empty ? null : { html: v, plaintext: v.replace(/<[^>]+>/g, "").trim() }
    else if (f.type === "image") out[f.name] = empty ? null : { _path: v, _authorUrl: null, _publishUrl: null }
    else if (f.type === "fragments") out[f.name] = (v || []).map(ref)
    else if (f.type === "fragment") out[f.name] = empty ? null : ref(v)
    else out[f.name] = empty ? null : v
  }
  return out
}

export function mock(s) {
  const root = s.content.find((c) => c.path === s.root.path)
  return { _comment: `Generated from the demo spec: the exact shape of ${s.conf}/${s.root.queryName || "page-by-path"}. Used when AEM is not connected.`,
    ...resolve(s, root, [root.model]) }
}

if (isMain(import.meta.url)) {
  const s = loadSpec()
  const what = process.argv[3] || "query"
  if (what === "query") process.stdout.write(query(s))
  else if (what === "mock") console.log(JSON.stringify(mock(s), null, 2))
  else { console.error(`Unknown output "${what}": query | mock`); process.exit(1) }
}
