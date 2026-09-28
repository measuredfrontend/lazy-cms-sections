# Lazy CMS sections with full SSR (SvelteKit)

A CMS page is a list of typed sections. This demo resolves **the same sections five different ways** and measures what each one does to your HTML, your downloads and your hydration.

The short version: **where the component is resolved decides whether your section exists in the HTML.**

| Route | Where lazy sections are resolved |
| --- | --- |
| `/universal` | `+page.ts` universal load (core map + `import.meta.glob`), CMS data validated in `+page.server.ts` |
| `/static` | Static imports of every section in the page |
| `/await-expression` | Svelte 5 async `await` inside a component (`experimental.async`) |
| `/await-in-template` | `{#await loadSection()}` block in the template |
| `/onmount` | `onMount` |
| `/unvalidated` | Control: same as `/universal`, without validating CMS data |

Pages (`?page=`): `full` (default: 5 known section types + 1 deliberately **unknown** type, which must render nothing), `simple` (only the 2 core sections), `gallery` (core + Gallery), `broken` (a Gallery with no images), `throw` (a section that throws while rendering).

## Run it

```sh
bun install
bun run build
bun run preview                     # http://localhost:4173
bunx playwright install chromium
node scripts/measure.mjs            # DELAY=1500 slows the JS files that contain lazy section code
node scripts/pack-tests.mjs         # T1-T10, the tests behind every rule
```

Open a route and press **Ctrl+U** (view source) to see which sections exist in the raw HTML.

## Measured (local production build, 27 Sep 2026, Windows 11, i9-13900KF)

| Route | Sections in SSR HTML | Hydrated, full page | Same, lazy section code +1.5 s | Core-only page downloads code for unused sections? |
| --- | --- | --- | --- | --- |
| `/universal` | **5/5** | 40 ms | 1,552 ms | **No** (88.2 KB JS) |
| `/static` | **5/5** | 35 ms | 1,526 ms | **Yes: Gallery, Accordion, Quote** (88.7 KB JS) |
| `/await-expression` | **5/5** | 41 ms | 1,547 ms | No |
| `/await-in-template` | 2/5 | 35 ms | 35 ms | No |
| `/onmount` | 2/5 | 35 ms | 34 ms | No |

"Hydrated" is a custom marker (root layout `onMount` sets `data-hydrated`), median of 3 runs on `vite preview`. Runs vary by a few ms, so treat 35 vs 40 ms as "about the same". With `DELAY`, every JS file containing Gallery, Accordion or Quote code is delayed: for `/static` that is the page's own chunk, for the others it is the lazy section chunks. Raw numbers: `results/`.

Findings:

1. `{#await}` in the template and `onMount` drop every lazy section from the server HTML. During SSR only the pending branch of `{#await}` renders, and `onMount` never runs on the server. Those sections pop in after hydration.
2. Resolving components in the universal load, or with Svelte's experimental async `await`, gives complete HTML, and a page only downloads the section code it uses (T4: a Gallery page loads Gallery code and nothing else). Static imports also give complete HTML, but every page downloads every section's code. Here the sections are tiny (0.5 KB difference); with real sections (galleries, maps, editors) it grows with the catalogue.
3. The broken versions *look* fast only because the content isn't there.
4. Any strategy that renders a section on the server must download that section's code before the page hydrates, and the **whole page** waits for it, not just that section.
5. `<svelte:boundary>` does **not** catch errors thrown during SSR: one throwing section returns a 500 for the whole page (T7). For bad CMS data, validating in the server load prevents it (T6, with `/unvalidated` as the control that fails); a bug in a component still needs fixing and an SSR test.
6. If a lazy section's JS fails to load in the browser, `loadSection` returns `null` during hydration and the section the server rendered disappears (T8).
7. A grep for lazy-section text finds it in SvelteKit's serialized page data even when the section was not rendered; strip `<script>` tags first (T9). Returning components from `+page.server.ts` is a 500, "Cannot stringify a function" (T10).

The universal load was ~5 ms slower than static imports here. That is within run-to-run noise. A possible cause is that lazy chunks are discovered only when the load runs in the browser; that is not measured yet and is the subject of the next part (modulepreload hints).

Versions: SvelteKit 2.70, Svelte 5.57, Vite 8.3, adapter-node 5.5.

## Two rules you can use today

1. **Resolve lazy section components in the universal load (`+page.ts`), never in the template.** SSR awaits the load before rendering, so every section is in the HTML. Components can't be serialized, so they can't come from `+page.server.ts`. (Test `T1`)
2. **Never put content behind `{#await import(...)}` or `onMount`.** During SSR only the pending branch of `{#await}` renders, and `onMount` never runs on the server. (Tests `T2`, `T3`)

The full set (7 rules with templates, drop-in tests and an audit prompt, for Claude Code, Cursor, Copilot and AGENTS.md) is **Measured Rules: Lazy CMS sections** at [measuredfrontend.com](https://measuredfrontend.com/rules/lazy-cms-sections). Free one-page checklist: [measuredfrontend.com/free](https://measuredfrontend.com/free).

## Key files

- `src/lib/registry.ts`: core map + on-demand `import.meta.glob`; unknown types return `null`
- `src/routes/universal/+page.ts`: resolves components in the universal load
- `src/routes/universal/+page.server.ts` + `src/lib/validate.ts`: CMS data validated before rendering
- `src/lib/AsyncSection.svelte`: the experimental async `await` variant
- `src/lib/SectionList.svelte`: renders sections, each inside `<svelte:boundary>` (client-side protection only)
- `scripts/measure.mjs`: SSR HTML check, downloads and hydration timing with Playwright
- `scripts/pack-tests.mjs`: T1-T10

## Licence

MIT. Use it, learn from it, ship it. Made by [Measured Frontend](https://measuredfrontend.com): frontend patterns, measured before they're taught.
