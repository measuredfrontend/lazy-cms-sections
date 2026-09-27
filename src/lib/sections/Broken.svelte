<script lang="ts">
	// Test-only section: throws while rendering. T7 uses it to show that <svelte:boundary>
	// does NOT catch errors during SSR: the whole page returns a 500.
	let { message }: { message: string } = $props();
	function explode(): string {
		throw new Error(message);
	}
</script>

<section data-section="Broken">{explode()}</section>
