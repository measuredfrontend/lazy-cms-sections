<script lang="ts">
	import type { Component } from 'svelte';

	type Resolved = { id: string; type: string; props: Record<string, unknown>; component: Component<any> | null };
	let { sections }: { sections: Resolved[] } = $props();
</script>

{#each sections as section (section.id)}
	{#if section.component}
		<!-- One broken section must never blank the whole page. -->
		<svelte:boundary>
			<section.component {...section.props} />
			{#snippet failed()}<!-- section failed to render -->{/snippet}
		</svelte:boundary>
	{/if}
{/each}
