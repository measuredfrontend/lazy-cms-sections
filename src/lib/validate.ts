import type { SectionData } from './cms';

// CMS data is untrusted input. Check it where it enters the app (the server load),
// before any component renders: <svelte:boundary> does not catch errors thrown during SSR.
const RULES: Record<string, (props: Record<string, unknown>) => boolean> = {
	Gallery: (p) => Array.isArray(p.images) && p.images.length > 0,
	Accordion: (p) => Array.isArray(p.items)
};

export function validSections(sections: SectionData[]): SectionData[] {
	return sections.filter((section) => {
		const ok = RULES[section.type]?.(section.props) ?? true;
		if (!ok) console.warn(`[sections] dropped invalid "${section.type}" (${section.id})`);
		return ok;
	});
}
