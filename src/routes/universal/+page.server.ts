import { getPage } from '$lib/cms';
import { validSections } from '$lib/validate';

export const load = ({ url }) => {
	const page = getPage(url.searchParams.get('page'));
	return { ...page, sections: validSections(page.sections) };
};
