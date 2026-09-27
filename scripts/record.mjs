// Records short browser clips of the demo for the long video (production build on :4173).
// Usage: node scripts/record.mjs <outDir>
// Each clip: 1280x720 webm. Lazy section chunks can be delayed to make pop-in visible.
import { chromium } from 'playwright';
import { mkdirSync, renameSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const OUT = process.argv[2] ?? 'recordings';
const LAZY = ['Gallery', 'Accordion', 'Quote'];
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ONLY=a,b records just those clips.
const ONLY = process.env.ONLY?.split(',');

async function clip(name, fn, { delayLazy = 0 } = {}) {
	if (ONLY && !ONLY.includes(name)) return;
	const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: OUT, size: { width: 1280, height: 720 } } });
	const page = await ctx.newPage();
	if (delayLazy) {
		await page.route('**/_app/immutable/**/*.js', async (r) => {
			const res = await r.fetch();
			const body = await res.text();
			if (LAZY.some((t) => body.includes(`data-section="${t}"`))) await sleep(delayLazy);
			await r.fulfill({ response: res, body });
		});
	}
	await fn(page);
	const video = page.video();
	await ctx.close();
	renameSync(await video.path(), join(OUT, `${name}.webm`));
	console.log('recorded', name);
}

// Bigger text for video. Works on normal pages and on view-source pages.
const zoom = (page, z) => page.evaluate((z) => (document.body.style.zoom = String(z)), z);
const scroll = async (page, total, steps = 30, ms = 60) => {
	for (let i = 0; i < steps; i++) {
		await page.mouse.wheel(0, total / steps);
		await sleep(ms);
	}
};
const find = (page, text) => page.evaluate((t) => window.find(t), text);

// 1. {#await}: placeholders first, sections pop in after hydration (layout shift)
await clip('await-page', async (p) => {
	await p.goto(`${BASE}/await-in-template`);
	await zoom(p, 1.5);
	await sleep(3500);
	await scroll(p, 500);
	await sleep(1500);
}, { delayLazy: 1500 });

// 2. {#await}: the raw HTML only contains "Loading ..."
await clip('await-source', async (p) => {
	await p.goto(`view-source:${BASE}/await-in-template`);
	await zoom(p, 1.6);
	await sleep(800);
	await find(p, 'Loading Gallery');
	await sleep(4000);
});

// 3. onMount: same pop-in
await clip('onmount-page', async (p) => {
	await p.goto(`${BASE}/onmount`);
	await zoom(p, 1.5);
	await sleep(3500);
	await scroll(p, 500);
	await sleep(1500);
}, { delayLazy: 1500 });

// 4. universal: everything there from the first paint
await clip('universal-page', async (p) => {
	await p.goto(`${BASE}/universal`);
	await zoom(p, 1.5);
	await sleep(1500);
	await scroll(p, 700, 40);
	await sleep(1500);
});

// 5. universal: the raw HTML contains the lazy sections
await clip('universal-source', async (p) => {
	await p.goto(`view-source:${BASE}/universal`);
	await zoom(p, 1.6);
	await sleep(800);
	await find(p, 'data-section="Gallery"');
	await sleep(4000);
});

// 6. bad CMS data without validation: the whole page is a 500
await clip('unvalidated-500', async (p) => {
	await p.goto(`${BASE}/unvalidated?page=broken`);
	await zoom(p, 1.6);
	await sleep(3500);
});

// 7. same data, validated in the server load: the bad section is dropped, the page renders
await clip('validated-ok', async (p) => {
	await p.goto(`${BASE}/universal?page=broken`);
	await zoom(p, 1.5);
	await sleep(2000);
	await scroll(p, 400);
	await sleep(1500);
});

// 8. components returned from +page.server.ts: not serializable, 500
await clip('server-component-500', async (p) => {
	await p.goto(`${BASE}/server-component`);
	await zoom(p, 1.6);
	await sleep(3500);
});

await browser.close();
console.log(readdirSync(OUT).join(', '));
