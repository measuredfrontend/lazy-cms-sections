<script lang="ts">
	import type { Component } from 'svelte';

	type Resolved = { id: string; type: string; props: Record<string, unknown>; component: Component<any> | null };
	let { sections }: { sections: Resolved[] } = $props();
</script>

{#each sections as section (section.id)}
	{#if section.component}
		<!-- The boundary only catches errors in the browser. During SSR a throwing section
		     still turns the whole page into a 500 (T7), so validate CMS data in the server load. -->
		<svelte:boundary>
			<section.component {...section.props} />
			{#snippet failed()}<!-- section failed to render -->{/snippet}
		</svelte:boundary>
	{/if}
{/each}
