# WKND Bank

A demo site for a fictional bank: Next.js 16 rendering AEM as a Cloud Service Content Fragments, and editable in the AEM Universal Editor.

```sh
npm install
npm run dev        # http://localhost:3000, renders sample content until AEM is connected
```

- The design came from a Stardust prototype: `stardust/prototypes/index-proposed.html`.
- The content model and sample content live in `aem/demo.spec.json`. `npm run aem:gen` regenerates the GraphQL query, the mock and the Universal Editor files.
- To use live content, set `NEXT_PUBLIC_AEM_HOST` (see `.env`) once the `wknd-bank/screen-by-path` persisted query exists (`npm run aem:persist`).

See [AGENTS.md](AGENTS.md) for the architecture, the Universal Editor rules and the conventions.
