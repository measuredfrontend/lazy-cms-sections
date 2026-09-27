# Lazy CMS sections with full SSR (SvelteKit)

A CMS page is a list of typed sections. This demo resolves the **same six sections four different ways** and measures what each one does to your HTML, your bundle and your hydration.

The short version: **where the `import()` runs decides everything.**

| Route | Where sections are resolved | In SSR HTML? | Code-split? |
| --- | --- | --- | --- |
| `/universal` | `+page.ts` universal load (eager map + `import.meta.glob`) | Yes, all | Yes |
| `/static` | Static imports in the page | Yes, all | No, whole catalogue shipped |
| `/await-in-template` | `{#await}` in the template | **No** | Yes |
| `/onmount` | `onMount` | **No** | Yes |

## Run it

```sh
bun install
bun run build
bun run preview          # http://localhost:4173
bunx playwright install chromium
node scripts/measure.mjs # DELAY=1500 by default (slow lazy chunks)
```

Open each route and press **Ctrl+U** (view source) to see which sections exist in the raw HTML.

## Key files

- `src/lib/registry.ts`: eager map + lazy `import.meta.glob`, unknown types return `null`
- `src/routes/universal/+page.ts`: resolves components in the universal load
- `src/lib/SectionList.svelte`: renders sections, each inside `<svelte:boundary>`
- `scripts/measure.mjs`: SSR HTML check + chunk and hydration timing with Playwright

## Measured (local production build, 27 Sep 2026)

| Route | Sections in SSR HTML | Hydrated at, no delay | Hydrated at, lazy chunks +1.5 s |
| --- | --- | --- | --- |
| `/universal` | 5 of 5 | 68 ms | 1,559 ms |
| `/static` | 5 of 5 | 36 ms | (shares the delayed code) |
| `/await-in-template` | 0 of 5 | 33 ms | 36 ms |
| `/onmount` | 0 of 5 | 34 ms | 33 ms |

Findings:

1. The universal load gives complete HTML **and** split code.
2. `{#await}` and `onMount` hydrate fast, but only because the content isn't there. The sections pop in later (SEO hole + layout shift).
3. Catch: on a hard load, the browser re-runs the universal load and fetches lazy chunks **before** hydration. The **whole page** waits for the slowest lazy chunk, not just that section. It also adds one sequential round trip, since those chunks aren't preloaded. Fix: part 3 (modulepreload hints).

Versions: SvelteKit 2, Svelte 5.57, Vite 8.3, adapter-node 5.5.

## Licence

MIT. Use it, learn from it, ship it.
