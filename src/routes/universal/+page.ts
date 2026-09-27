import { loadSection } from '$lib/registry';

// Universal load: runs on the server during SSR AND again in the browser.
// Components can't be serialized, so they are resolved here, not in +page.server.ts.
// SSR awaits this before rendering, so every section ends up in the HTML.
export async function load({ data }) {
	const resolved = [];
	for (const section of data.sections) resolved.push(loadSection(section.type).then((component) => ({ ...section, component })));
	return { title: data.title, sections: await Promise.all(resolved) };
}
