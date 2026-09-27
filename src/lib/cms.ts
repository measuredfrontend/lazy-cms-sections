// A fake CMS response: an ordered list of typed sections.
// In a real project this comes from your CMS API in +page.server.ts.
export type SectionData = { id: string; type: string; props: Record<string, unknown> };

export function getPage(): { title: string; sections: SectionData[] } {
	return {
		title: 'Demo page',
		sections: [
			{ id: 's1', type: 'Hero', props: { title: 'Lazy sections, full SSR', subtitle: 'Every section below is in the HTML.' } },
			{ id: 's2', type: 'TextBlock', props: { heading: 'Why it matters', body: 'Crawlers and no-JS users see everything.' } },
			{ id: 's3', type: 'Gallery', props: { images: [{ src: '', alt: 'Slide one' }, { src: '', alt: 'Slide two' }, { src: '', alt: 'Slide three' }] } },
			{ id: 's4', type: 'Accordion', props: { items: [{ q: 'Is it SEO safe?', a: 'Yes, check the page source.' }, { q: 'Does it split code?', a: 'Yes, one chunk per section type.' }] } },
			{ id: 's5', type: 'Quote', props: { text: 'Where the import runs decides everything.', author: 'This demo' } },
			{ id: 's6', type: 'DoesNotExist', props: {} }
		]
	};
}
