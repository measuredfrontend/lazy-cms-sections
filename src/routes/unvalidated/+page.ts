import { loadSection } from '$lib/registry';
import type { SectionData } from '$lib/cms';

// Universal load: runs on the server during SSR AND again in the browser.
// Components can't be serialized, so they are resolved here, not in +page.server.ts.
// SSR awaits this before rendering, so every section ends up in the HTML.
const withComponent = async (section: SectionData) => ({
	...section,
	component: await loadSection(section.type)
});

export async function load({ data }) {
	const resolved = await Promise.all(data.sections.map(withComponent));
	return { title: data.title, sections: resolved };
}
