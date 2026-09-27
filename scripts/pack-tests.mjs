// Tests behind every rule of the Topic 01 AI pack (R14: a rule without a passing test doesn't ship).
// Run against the production build: bun run build && bun run preview, then node scripts/pack-tests.mjs
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const LAZY = ['Gallery', 'Accordion', 'Quote'];
const ALL = ['Hero', 'TextBlock', ...LAZY];
const html = async (path) => {
	const res = await fetch(BASE + path);
	return { status: res.status, body: await res.text() };
};
const has = (body, t) => body.includes(`data-section="${t}"`);

async function lazyChunksFetched(path) {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	const seen = new Set();
	page.on('response', async (r) => {
		if (!/\/_app\/immutable\/.*\.js$/.test(r.url())) return;
		const body = await r.text().catch(() => '');
		LAZY.filter((t) => body.includes(`data-section="${t}"`)).forEach((t) => seen.add(t));
	});
	await page.goto(BASE + path);
	await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
	await page.waitForTimeout(300);
	await browser.close();
	return [...seen];
}

const tests = {
	'T1-universal-ssr-complete': async () => {
		const { body } = await html('/universal');
		const missing = ALL.filter((t) => !has(body, t));
		return { pass: missing.length === 0, detail: missing.length ? `missing: ${missing}` : 'all 5 sections in SSR HTML' };
	},
	'T2-await-block-drops-lazy': async () => {
		const { body } = await html('/await-in-template');
		const present = LAZY.filter((t) => has(body, t));
		return { pass: present.length === 0 && body.includes('Loading Gallery'), detail: 'lazy sections absent; SSR sends the pending branch' };
	},
	'T3-onmount-drops-lazy': async () => {
		const { body } = await html('/onmount');
		return { pass: LAZY.every((t) => !has(body, t)), detail: 'lazy sections absent from SSR HTML' };
	},
	'T4-page-downloads-only-its-section-types': async () => {
		const universal = await lazyChunksFetched('/universal?page=simple');
		const stat = await lazyChunksFetched('/static?page=simple');
		const galleryPage = await lazyChunksFetched('/universal?page=gallery');
		const onlyGallery = galleryPage.length === 1 && galleryPage[0] === 'Gallery';
		return {
			pass: universal.length === 0 && stat.length === 3 && onlyGallery,
			detail: `core-only page: universal loads code for ${universal.length} lazy sections, static for ${stat.length}; gallery page (universal) loads: ${galleryPage.join(', ') || 'none'}`
		};
	},
	'T5-unknown-type-renders-nothing': async () => {
		const { status, body } = await html('/universal');
		const markup = body.replace(/<script[\s\S]*?<\/script>/g, ''); // page data may still mention the type
		return { pass: status === 200 && !has(markup, 'DoesNotExist') && ALL.every((t) => has(markup, t)), detail: `status ${status}; unknown type skipped, known sections rendered` };
	},
	'T6-invalid-cms-data-dropped': async () => {
		const { status, body } = await html('/universal?page=broken');
		const others = ['Hero', 'TextBlock', 'Quote'].filter((t) => has(body, t));
		// Control: the same page without validation must fail, or this test proves nothing.
		const control = await html('/unvalidated?page=broken');
		return {
			pass: status === 200 && others.length === 3 && !has(body, 'Gallery') && control.status === 500,
			detail: `validated: status ${status}, Gallery ${has(body, 'Gallery') ? 'present' : 'dropped'}, others ${others.length}/3; control without validation: status ${control.status}`
		};
	},
	// Finding, not a feature: a section that throws during SSR takes the whole page down.
	'T7-boundary-does-not-catch-ssr-errors': async () => {
		const { status } = await html('/universal?page=throw');
		return { pass: status === 500, detail: `status ${status} (expected 500: <svelte:boundary> does not catch SSR render errors)` };
	},
	// Finding, not a feature: if a lazy chunk fails to load in the browser, loadSection returns null
	// during hydration and the section the server already rendered disappears.
	'T8-failed-chunk-removes-ssr-section': async () => {
		const browser = await chromium.launch();
		const page = await browser.newPage();
		await page.route(/\/_app\/immutable\/.*\.js$/, async (route) => {
			const res = await route.fetch();
			const body = await res.text();
			if (body.includes('data-section="Gallery"')) return route.abort();
			return route.fulfill({ response: res, body });
		});
		const { body } = await html('/universal?page=gallery');
		await page.goto(BASE + '/universal?page=gallery');
		await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true', null, { timeout: 5000 }).catch(() => {});
		await page.waitForTimeout(300);
		const inDom = (await page.locator('[data-section="Gallery"]').count()) > 0;
		await browser.close();
		return { pass: has(body, 'Gallery') && !inDom, detail: `Gallery in SSR HTML: ${has(body, 'Gallery')}; after hydration with its chunk blocked: ${inDom ? 'still there' : 'gone'}` };
	}
};

const results = {};
for (const [id, fn] of Object.entries(tests)) {
	try {
		results[id] = await fn();
	} catch (e) {
		results[id] = { pass: false, detail: String(e) };
	}
	console.log(`${results[id].pass ? 'PASS' : 'FAIL'} ${id}: ${results[id].detail}`);
}
mkdirSync('results', { recursive: true });
writeFileSync('results/pack-tests.json', JSON.stringify({ date: new Date().toISOString(), results }, null, 2));
process.exit(Object.values(results).every((r) => r.pass) ? 0 : 1);
