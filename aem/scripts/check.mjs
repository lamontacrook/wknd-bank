#!/usr/bin/env node
// Offline check (no AEM): the generated query validates against a schema built the way AEM names
// Content Fragment types, and the generated mock is exactly what that query returns.
// Needs the `graphql` package in the current project (npm i -D graphql); run from the project root.
//   node check.mjs <spec>
import { createRequire } from "node:module"
import { isDeepStrictEqual } from "node:util"
import { byPathField, isMain, loadSpec, typeName } from "./lib.mjs"
import { mock, query } from "./query.mjs"

if (isMain(import.meta.url)) {
  const s = loadSpec()
  let gql
  try { gql = createRequire(`${process.cwd()}/`)("graphql") } catch {
    console.error("graphql is not installed in this project: npm i -D graphql")
    process.exit(1)
  }
  const { buildSchema, parse, validate, execute } = gql
  const ref = (f) => (f.models.length > 1 ? `${f.models.map((m) => typeName(s.modelById[m])).join("")}Union` : typeName(s.modelById[f.models[0]]))
  const SCALARS = { text: "String", enum: "String", number: "Float", date: "Date", multiline: "MultiFormatString", image: "Reference" }
  const type = (f) => SCALARS[f.type] || (f.type === "fragments" ? `[${ref(f)}]` : ref(f))
  const unions = new Set()
  for (const m of s.models) for (const f of m.fields) if (f.models?.length > 1) unions.add(`union ${ref(f)} = ${f.models.map((x) => typeName(s.modelById[x])).join(" | ")}`)
  const schema = buildSchema(`
scalar Date
type MultiFormatString { html: String plaintext: String markdown: String json: String }
type ImageRef { _path: String _authorUrl: String _publishUrl: String _dynamicUrl: String mimeType: String }
type DocumentRef { _path: String _authorUrl: String _publishUrl: String }
union Reference = ImageRef | DocumentRef
type ModelInfo { title: String _path: String }
${[...unions].join("\n")}
${s.models.map((m) => `type ${typeName(m)} { _path: ID _variation: String _model: ModelInfo ${m.fields.map((f) => `${f.name}: ${type(f)}`).join(" ")} }
type ${typeName(m)}Result { item: ${typeName(m)} }`).join("\n")}
type Query { ${s.models.map((m) => `${byPathField(m)}(_path: String!, variation: String): ${typeName(m)}Result`).join(" ")} }`)

  const doc = parse(query(s))
  const errors = validate(schema, doc).map((e) => `query: ${e.message}`)
  if (!errors.length) {
    const item = mock(s)
    delete item._comment
    const byTitle = Object.fromEntries(s.models.map((m) => [m.title, m]))
    const result = execute({
      schema, document: doc, variableValues: { path: item._path },
      rootValue: { [byPathField(s.modelById[s.root.model])]: { item } },
      typeResolver: (v) => (v?._model ? typeName(byTitle[v._model.title]) : "ImageRef"),
    })
    for (const e of result.errors || []) errors.push(`execute: ${e.message}`)
    const got = JSON.parse(JSON.stringify(Object.values(result.data || {})[0]?.item ?? null))
    if (!result.errors && !isDeepStrictEqual(got, item)) errors.push("mock: differs from the query result")
  }
  if (errors.length) {
    errors.forEach((e) => console.error(`✗ ${e}`))
    process.exit(1)
  }
  console.log(`✓ query validates against the ${s.models.length}-model schema and the mock matches its result`)
}
