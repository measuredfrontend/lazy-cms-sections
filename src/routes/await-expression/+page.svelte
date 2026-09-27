<script lang="ts">
	// Svelte 5 async (experimental): each section awaits its component inside the component itself.
	import AsyncSection from '$lib/AsyncSection.svelte';
	let { data } = $props();
</script>

{#each data.sections as s (s.id)}
	<AsyncSection type={s.type} props={s.props} />
{/each}
