// A fake CMS response: an ordered list of typed sections.
// In a real project this comes from your CMS API in +page.server.ts.
export type SectionData = { id: string; type: string; props: Record<string, unknown> };

const hero: SectionData = { id: 's1', type: 'Hero', props: { title: 'Lazy sections, full SSR', subtitle: 'Every section below is in the HTML.' } };
const text: SectionData = { id: 's2', type: 'TextBlock', props: { heading: 'Why it matters', body: 'Crawlers and no-JS users see everything.' } };
const gallery: SectionData = { id: 's3', type: 'Gallery', props: { images: [{ src: '', alt: 'Slide one' }, { src: '', alt: 'Slide two' }, { src: '', alt: 'Slide three' }] } };
const accordion: SectionData = { id: 's4', type: 'Accordion', props: { items: [{ q: 'Is it SEO safe?', a: 'Yes, check the page source.' }, { q: 'Does it split code?', a: 'Yes, one chunk per section type.' }] } };
const quote: SectionData = { id: 's5', type: 'Quote', props: { text: 'Where the import runs decides everything.', author: 'This demo' } };
// A type the front end doesn't know: must render nothing and never crash the page.
const unknown: SectionData = { id: 's6', type: 'DoesNotExist', props: {} };

// ?page=full (default): 5 known section types + 1 unknown type.
// ?page=simple: only the 2 core sections, to measure what each strategy downloads for a small page.
export function getPage(kind: string | null = 'full'): { title: string; sections: SectionData[] } {
	if (kind === 'simple') return { title: 'Simple page', sections: [hero, text] };
	// ?page=gallery: core sections + one lazy type, to check that only that type's code is downloaded.
	if (kind === 'gallery') return { title: 'Gallery page', sections: [hero, text, gallery] };
	// ?page=broken: bad CMS data (a Gallery with no images would crash while rendering).
	if (kind === 'broken') return { title: 'Bad CMS data', sections: [hero, { id: 'sx', type: 'Gallery', props: { images: [] } }, text, quote] };
	// ?page=throw: a section with a bug that throws during SSR (to test what <svelte:boundary> catches).
	if (kind === 'throw') return { title: 'Throwing section', sections: [hero, { id: 'sy', type: 'Broken', props: { message: 'boom' } }, text, quote] };
	return { title: 'Demo page', sections: [hero, text, gallery, accordion, quote, unknown] };
}
