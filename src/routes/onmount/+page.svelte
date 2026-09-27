<script lang="ts">
	// ANTI-PATTERN for content: core sections render on the server,
	// but lazy ones are loaded in onMount, which never runs during SSR.
	import { onMount } from 'svelte';
	import { CORE, loadSection } from '$lib/registry';
	import SectionList from '$lib/SectionList.svelte';

	let { data } = $props();
	let lazy = $state<Record<string, any>>({});
	const sections = $derived(data.sections.map((s) => ({ ...s, component: CORE[s.type] ?? lazy[s.id] ?? null })));

	onMount(async () => {
		for (const s of data.sections) {
			if (!CORE[s.type]) loadSection(s.type).then((c) => (lazy[s.id] = c));
		}
	});
</script>

<SectionList {sections} />
