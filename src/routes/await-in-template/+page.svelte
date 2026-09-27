<script lang="ts">
	// ANTI-PATTERN: the promise is created during SSR, but SSR never waits for it.
	// The server sends the pending branch; sections pop in after hydration (SEO hole + CLS).
	import { resolveSection } from '$lib/registry';
	let { data } = $props();
</script>

{#each data.sections as s (s.id)}
	{#await resolveSection(s.type)}
		<div class="placeholder">Loading {s.type}...</div>
	{:then Component}
		{#if Component}<Component {...s.props} />{/if}
	{/await}
{/each}

<style>
	.placeholder { padding: 1rem; background: #f6f8fa; color: #8b949e; border-radius: 8px; }
</style>
