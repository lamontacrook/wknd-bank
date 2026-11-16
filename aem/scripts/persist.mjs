#!/usr/bin/env node
// Persists the generated query on an AEM author and runs it against the root page.
// The AEM MCP token can't reach /graphql/* (403, outside its scopes), so this uses a developer token.
//   AEM_HOST=https://author-pXXXX-eYYYY.adobeaemcloud.com AEM_TOKEN=<token> node persist.mjs <spec> [query.graphql] [--no-publish]
// AEM_TOKEN: author → Developer Console → Integrations → Local token (24h).
// Prerequisite: the configuration has "GraphQL Persistent Queries" ticked.
import { readFileSync } from "node:fs"
import { isMain, loadSpec } from "./lib.mjs"
import { query as generate } from "./query.mjs"

if (isMain(import.meta.url)) {
  const s = loadSpec()
  const HOST = (process.env.AEM_HOST || "").replace(/\/$/, "")
  const TOKEN = process.env.AEM_TOKEN
  if (!HOST || !TOKEN) {
    console.error("Set AEM_HOST and AEM_TOKEN (Developer Console → Integrations → Local token).")
    process.exit(1)
  }
  const name = s.root.queryName || "page-by-path"
  const query = process.argv[3] ? readFileSync(process.argv[3], "utf8") : generate(s)
  const auth = { Authorization: `Bearer ${TOKEN}` }

  const call = async (method, url, body) => {
    const res = await fetch(url, { method, headers: body ? { ...auth, "Content-Type": "application/json" } : auth, body: body && JSON.stringify(body) })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { json = undefined }
    return { status: res.status, json, text }
  }

  // PUT creates; it fails when the query exists, so update with POST.
  const persistUrl = `${HOST}/graphql/persist.json/${s.conf}/${name}`
  let res = await call("PUT", persistUrl, { query })
  if (res.status >= 400 && (res.status === 409 || /exist/i.test(res.text))) res = await call("POST", persistUrl, { query })
  if (res.status >= 400) {
    console.error(`Persist failed: ${res.status}\n${res.text.slice(0, 1000)}`)
    process.exit(1)
  }
  console.log(`Persisted ${s.conf}/${name} (${res.status})`)

  const execUrl = `${HOST}/graphql/execute.json/${s.conf}/${name};path=${s.fragmentPath(s.root.path)}`
  const run = await call("GET", execUrl)
  if (run.status >= 400 || run.json?.errors) {
    console.error(`Execute failed: ${run.status}\n${(run.json ? JSON.stringify(run.json.errors || run.json, null, 2) : run.text).slice(0, 2000)}`)
    process.exit(1)
  }
  const item = Object.values(run.json?.data || {})[0]?.item
  console.log(`Executed ${execUrl}`)
  console.log(JSON.stringify(item, null, 2).slice(0, 1500))

  // Persisted queries live on author until replicated; publish answers 404 "Could not find Persisted Query" without this.
  // Pass --no-publish to keep it author-only. The fragments and models must be published separately.
  if (!process.argv.includes("--no-publish")) {
    const rep = await call("POST", `${HOST}/graphql/replicate.json/${s.conf}/${name}`)
    if (rep.status >= 400) {
      console.error(`Publish failed: ${rep.status}\n${rep.text.slice(0, 500)}\nPublish it from GraphiQL (Persisted Queries → Publish) instead.`)
      process.exit(1)
    }
    console.log(`Published ${s.conf}/${name} (${rep.status})`)
  }
}
