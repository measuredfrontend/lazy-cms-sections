import { resolveSection } from '$lib/registry';
import type { PageLoad } from './$types';

// Universal load: runs on the server during SSR AND in the browser.
// Components can't be serialized, so they must be resolved here, not in +page.server.ts.
// Because this is awaited before render, every section is in the SSR HTML.
export const load: PageLoad = async ({ data }) => {
	const sections = await Promise.all(
		data.sections.map(async (s) => ({ ...s, component: await resolveSection(s.type) }))
	);
	return { title: data.title, sections };
};
