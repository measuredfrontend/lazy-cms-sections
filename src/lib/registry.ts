import type { Component } from 'svelte';
import Hero from './sections/Hero.svelte';
import TextBlock from './sections/TextBlock.svelte';

type AnyComponent = Component<any>;

// CORE: sections most pages start with. They ship with the route and never wait for a fetch.
export const CORE: Record<string, AnyComponent> = { Hero, TextBlock };

// Everything else: a lazy glob. Vite emits one chunk per file,
// and a page only downloads the chunks for the section types it actually uses.
// An unknown type is just a missing key: no failed request.
const ON_DEMAND = import.meta.glob<{ default: AnyComponent }>('./sections/*.svelte');

export async function loadSection(type: string): Promise<AnyComponent | null> {
	const core = CORE[type];
	if (core) return core;
	const importer = ON_DEMAND[`./sections/${type}.svelte`];
	if (!importer) return null; // unknown type: render nothing, never crash the page
	try {
		const mod = await importer();
		return mod.default;
	} catch (err) {
		console.warn(`[sections] could not load "${type}"`, err);
		return null;
	}
}
