<script lang="ts">
	// Baseline: every section statically imported. Full SSR, but every page
	// ships the whole catalogue's JS, even for sections it never uses.
	import Hero from '$lib/sections/Hero.svelte';
	import TextBlock from '$lib/sections/TextBlock.svelte';
	import Gallery from '$lib/sections/Gallery.svelte';
	import Accordion from '$lib/sections/Accordion.svelte';
	import Quote from '$lib/sections/Quote.svelte';
	import SectionList from '$lib/SectionList.svelte';

	const MAP: Record<string, any> = { Hero, TextBlock, Gallery, Accordion, Quote };
	let { data } = $props();
	const sections = $derived(data.sections.map((s) => ({ ...s, component: MAP[s.type] ?? null })));
</script>

<SectionList {sections} />
