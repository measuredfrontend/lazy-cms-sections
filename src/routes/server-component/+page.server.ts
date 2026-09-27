import { getPage } from '$lib/cms';
import { loadSection } from '$lib/registry';

// ANTI-PATTERN: resolving components in the server load.
// Server load data is serialized to the browser, and a component (a function) can't be serialized.
export async function load() {
	const page = getPage('simple');
	const sections = await Promise.all(page.sections.map(async (s) => ({ ...s, component: await loadSection(s.type) })));
	return { ...page, sections };
}