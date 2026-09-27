<script lang="ts">
	// Svelte's async `await` (compilerOptions.experimental.async).
	// Unlike {#await}, an await expression is resolved during SSR.
	import { loadSection } from '$lib/registry';
	let { type, props }: { type: string; props: Record<string, unknown> } = $props();
	const Component = $derived(await loadSection(type));
</script>

{#if Component}<Component {...props} />{/if}
