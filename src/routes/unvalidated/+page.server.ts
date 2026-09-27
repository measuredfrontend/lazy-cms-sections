import { getPage } from '$lib/cms';

// CONTROL route for T6: the same universal load, but CMS data is NOT validated.
// With ?page=broken the empty Gallery throws during SSR and the whole page returns 500.
export const load = ({ url }) => getPage(url.searchParams.get('page'));

