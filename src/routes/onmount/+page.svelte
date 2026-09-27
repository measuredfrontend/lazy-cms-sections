<script lang="ts">
	// ANTI-PATTERN for content: onMount never runs on the server,
	// so the SSR HTML has no sections at all. Fine only for client-only widgets.
	import { onMount } from 'svelte';
	import { resolveSection } from '$lib/registry';
	import SectionList from '$lib/SectionList.svelte';

	let { data } = $props();
	let sections = $state<any[]>([]);

	onMount(async () => {
		sections = await Promise.all(
			data.sections.map(async (s) => ({ ...s, component: await resolveSection(s.type) }))
		);
	});
</script>

<SectionList {sections} />
