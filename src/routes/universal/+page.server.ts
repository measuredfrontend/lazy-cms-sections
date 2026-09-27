import { getPage } from '$lib/cms';

export const load = ({ url }) => getPage(url.searchParams.get('page'));
