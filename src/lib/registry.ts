import type { Component } from 'svelte';
import Hero from './sections/Hero.svelte';
import TextBlock from './sections/TextBlock.svelte';

type AnyComponent = Component<any>;

// EAGER: on (almost) every page or LCP-critical. Bundled with the route, never fetched separately.
export const EAGER: Record<string, AnyComponent> = { Hero, TextBlock };

// LAZY: a non-eager glob. Vite turns every matched file into its own chunk,
// loaded only when a page actually uses that section type.
// Unknown types are simply a missing key -> no failed network request.
const LAZY = import.meta.glob<{ default: AnyComponent }>('./sections/*.svelte');

export async function resolveSection(type: string): Promise<AnyComponent | null> {
	if (EAGER[type]) return EAGER[type];
	const load = LAZY[`./sections/${type}.svelte`];
	if (!load) return null; // unknown type: render nothing, never crash the page
	try {
		return (await load()).default;
	} catch (err) {
		console.warn(`[sections] failed to load "${type}"`, err);
		return null;
	}
}
