// Measures each strategy against the production build (`bun run build && bun run preview`).
// For every route, two pages:
//   full   = 5 known section types (+1 unknown): which sections are in the SSR HTML, hydration time
//   simple = 2 core sections only: how much section code does each strategy download anyway?
// DELAY (ms) slows every JS chunk that contains a lazy section (Gallery/Accordion/Quote).
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const DELAY = Number(process.env.DELAY ?? 0);
const ROUTES = ['/universal', '/static', '/await-expression', '/await-in-template', '/onmount'];
const ALL = ['Hero', 'TextBlock', 'Gallery', 'Accordion', 'Quote'];
const LAZY = ['Gallery', 'Accordion', 'Quote'];

async function visit(browser, url) {
	const page = await browser.newPage();
	const lazyFetched = new Set();
	let jsFiles = 0, jsBytes = 0;
	await page.route('**/_app/immutable/**/*.js', async (r) => {
		let res, body;
		try { res = await r.fetch(); body = await res.text(); } catch { return; }
		jsFiles++;
		jsBytes += Buffer.byteLength(body);
		const hit = LAZY.filter((t) => body.includes(`data-section="${t}"`));
		if (hit.length) {
			hit.forEach((t) => lazyFetched.add(t));
			if (DELAY) await new Promise((ok) => setTimeout(ok, DELAY));
		}
		await r.fulfill({ response: res, body }).catch(() => {});
	});
	await page.goto(url);
	await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true', null, { timeout: 30000 });
	const hydratedAtMs = Math.round(await page.evaluate(() => window.__hydratedAt));
	await page.unrouteAll({ behavior: 'ignoreErrors' });
	await page.close();
	return { lazyFetched: [...lazyFetched], jsFiles, jsKB: Math.round(jsBytes / 102.4) / 10, hydratedAtMs };
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const browser = await chromium.launch();
const results = [];

for (const route of ROUTES) {
	const html = await (await fetch(`${BASE}${route}`)).text();
	const inHtml = ALL.filter((t) => html.includes(`data-section="${t}"`));
	const full = [];
	for (let i = 0; i < 3; i++) full.push(await visit(browser, `${BASE}${route}`));
	const simple = await visit(browser, `${BASE}${route}?page=simple`);
	results.push({
		route,
		sectionsInSsrHtml: `${inHtml.length}/5`,
		fullHydratedMs: median(full.map((r) => r.hydratedAtMs)),
		simpleLazyChunks: simple.lazyFetched.length ? simple.lazyFetched.join(', ') : 'none',
		simpleJsKB: simple.jsKB
	});
}

await browser.close();
console.log(`Chunk delay: ${DELAY} ms`);
console.table(results);
mkdirSync('results', { recursive: true });
writeFileSync(`results/measure-delay${DELAY}.json`, JSON.stringify({ date: new Date().toISOString(), base: BASE, delayMs: DELAY, results }, null, 2));
