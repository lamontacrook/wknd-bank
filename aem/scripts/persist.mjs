#!/usr/bin/env node
// Persists the generated query on an AEM author and runs it against the root page.
// The AEM MCP token can't reach /graphql/* (403, outside its scopes), so this uses a developer token.
//   node persist.mjs <spec> [query.graphql] [--no-publish]
// AEM_HOST defaults to NEXT_PUBLIC_AEM_AUTHOR from .env. AEM_TOKEN is prompted for (hidden) when not set.
// Token: Cloud Manager → environment … → Developer Console → Integrations → Local token → "accessToken" (24h).
// Prerequisite: the configuration has "GraphQL Persistent Queries" ticked.
import { existsSync, readFileSync } from "node:fs"
import { createInterface } from "node:readline"
import { isMain, loadSpec } from "./lib.mjs"
import { query as generate } from "./query.mjs"

const fromDotEnv = (key) =>
  existsSync(".env") ? readFileSync(".env", "utf8").match(new RegExp(`^${key}=(\\S+)`, "m"))?.[1] : undefined

function askHidden(question) {
  if (!process.stdin.isTTY) return Promise.resolve("")
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  return new Promise((done) => {
    rl.on("close", () => done(""))
    rl.question(question, (answer) => {
      done(answer.trim().replace(/^"|"$/g, ""))
      process.stdout.write("\n")
      rl.close()
    })
    rl._writeToOutput = (text) => { if (text.startsWith(question)) process.stdout.write(question) }
  })
}

if (isMain(import.meta.url)) {
  const s = loadSpec()
  const HOST = (process.env.AEM_HOST || fromDotEnv("NEXT_PUBLIC_AEM_AUTHOR") || "").replace(/\/$/, "")
  if (!HOST) {
    console.error("Set AEM_HOST to the author origin, e.g. https://author-pXXXX-eYYYY.adobeaemcloud.com")
    process.exit(1)
  }
  const TOKEN = process.env.AEM_TOKEN || (await askHidden(`AEM token for ${HOST} (input hidden, paste and press Enter): `))
  if (!TOKEN) {
    console.error("No token. Developer Console → Integrations → Local token → copy \"accessToken\".")
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
