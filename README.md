# Lazy CMS sections with full SSR (SvelteKit)

A CMS page is a list of typed sections. This demo resolves **the same sections five different ways** and measures what each one does to your HTML, your downloads and your hydration.

The short version: **where the component is resolved decides whether your section exists in the HTML.**

| Route | Where lazy sections are resolved |
| --- | --- |
| `/universal` | `+page.ts` universal load (core map + `import.meta.glob`) |
| `/static` | Static imports of every section in the page |
| `/await-expression` | Svelte 5 async `await` inside a component (`experimental.async`) |
| `/await-in-template` | `{#await loadSection()}` block in the template |
| `/onmount` | `onMount` |

Two pages per route: `?page=full` (default: 5 known section types + 1 deliberately **unknown** type, which must render nothing) and `?page=simple` (only the 2 core sections).

## Run it

```sh
bun install
bun run build
bun run preview                     # http://localhost:4173
bunx playwright install chromium
node scripts/measure.mjs            # DELAY=1500 to slow the lazy section chunks
```

Open a route and press **Ctrl+U** (view source) to see which sections exist in the raw HTML.

## Measured (local production build, 27 Sep 2026, Windows 11, i9-13900KF)

| Route | Sections in SSR HTML | Interactive (full page) | Same, one lazy chunk +1.5 s | Simple page downloads unused section code? |
| --- | --- | --- | --- | --- |
| `/universal` | **5/5** | 42 ms | 1,545 ms | **No** |
| `/static` | **5/5** | 37 ms | 1,527 ms | **Yes: Gallery, Accordion, Quote** |
| `/await-expression` | **5/5** | 42 ms | 1,546 ms | No |
| `/await-in-template` | 2/5 | 35 ms | 35 ms | No |
| `/onmount` | 2/5 | 35 ms | 34 ms | No |

Findings:

1. `{#await}` in the template and `onMount` drop every lazy section from the server HTML. The docs confirm that during SSR only the pending branch of `{#await}` renders. Those sections pop in after hydration.
2. Resolving components in the universal load, or with Svelte's experimental async `await`, gives complete HTML, and a page only downloads the section code it uses. Static imports also give complete HTML, but every page downloads every section's code. Here the sections are tiny, so the byte difference is small; with real sections (galleries, maps, editors) it grows with the catalogue.
3. The broken versions *look* faster (35 ms) only because the content isn't there.
4. Any strategy that renders a section on the server must download that section's code before the page becomes interactive, and the **whole page** waits for it, not just that section. With a lazy chunk slowed by 1.5 s (simulated in the measure script), every complete strategy waited about 1.5 s. The universal load adds one small extra round trip locally (42 vs 37 ms), because lazy chunks are discovered only when the load re-runs in the browser. Part 3 measures fixing that with modulepreload hints.

Versions: SvelteKit 2.70, Svelte 5.57, Vite 8.3, adapter-node 5.5. Raw numbers: `results/`.

## Key files

- `src/lib/registry.ts`: core map + on-demand `import.meta.glob`; unknown types return `null`
- `src/routes/universal/+page.ts`: resolves components in the universal load
- `src/lib/AsyncSection.svelte`: the experimental async `await` variant
- `src/lib/SectionList.svelte`: renders sections, each inside `<svelte:boundary>`
- `scripts/measure.mjs`: SSR HTML check, chunk downloads and hydration timing with Playwright

## Licence

MIT. Use it, learn from it, ship it.
