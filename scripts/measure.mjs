// Measures each strategy against the production build (`bun run build && bun run preview`).
// 1. Raw SSR HTML: which sections are in the page source?
// 2. Browser: which section chunks are fetched, and when does the page become interactive?
//    Chunks containing a lazy section (Gallery/Accordion/Quote) are delayed by DELAY ms
//    to simulate a slow network and make any waiting visible.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const DELAY = Number(process.env.DELAY ?? 1500);
const ROUTES = ['/universal', '/static', '/await-in-template', '/onmount'];
const ALL = ['Hero', 'TextBlock', 'Gallery', 'Accordion', 'Quote'];
const LAZY = ['Gallery', 'Accordion', 'Quote'];

const results = [];
const browser = await chromium.launch();

for (const route of ROUTES) {
	const html = await (await fetch(BASE + route)).text();
	const inHtml = ALL.filter((t) => html.includes(`data-section="${t}"`));

	const page = await browser.newPage();
	const lazyFetched = new Set();
	let jsFiles = 0;
	await page.route('**/_app/immutable/**/*.js', async (r) => {
		jsFiles++;
		let res, body;
		try { res = await r.fetch(); body = await res.text(); } catch { return; }
		const hit = LAZY.filter((t) => body.includes(`data-section="${t}"`));
		if (hit.length) {
			hit.forEach((t) => lazyFetched.add(t));
			await new Promise((ok) => setTimeout(ok, DELAY));
		}
		await r.fulfill({ response: res, body }).catch(() => {});
	});
	const t0 = Date.now();
	await page.goto(BASE + route);
	await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true', null, { timeout: 30000 });
	const hydratedAtMs = Math.round(await page.evaluate(() => window.__hydratedAt));
	results.push({
		route,
		sectionsInSsrHtml: inHtml.join(', ') || '(none)',
		lazyChunksFetched: [...lazyFetched].join(', ') || '-',
		jsFiles,
		hydratedAtMs
	});
	await page.unrouteAll({ behavior: 'ignoreErrors' });
	await page.close();
}

await browser.close();
console.log(`Lazy-chunk delay: ${DELAY} ms`);
console.table(results);
mkdirSync('results', { recursive: true });
writeFileSync(`results/measure-delay${DELAY}.json`, JSON.stringify({ base: BASE, delayMs: DELAY, results }, null, 2));
