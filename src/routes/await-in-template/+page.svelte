<script lang="ts">
	// ANTI-PATTERN: core sections render normally, but lazy ones use {#await import} in the template.
	// SSR renders only the pending branch, so lazy sections are missing from the HTML
	// and pop in after hydration (layout shift).
	import { CORE, loadSection } from '$lib/registry';
	let { data } = $props();
</script>

{#each data.sections as s (s.id)}
	{@const Core = CORE[s.type]}
	{#if Core}
		<Core {...s.props} />
	{:else}
		{#await loadSection(s.type)}
			<div class="placeholder">Loading {s.type}...</div>
		{:then Component}
			{#if Component}<Component {...s.props} />{/if}
		{/await}
	{/if}
{/each}

<style>
	.placeholder { padding: 1rem; background: #f6f8fa; color: #8b949e; border-radius: 8px; }
</style>
