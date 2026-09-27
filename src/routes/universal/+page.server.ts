import { getPage } from '$lib/cms';

// Server load: fetch plain, serializable CMS data.
export const load = () => getPage();
