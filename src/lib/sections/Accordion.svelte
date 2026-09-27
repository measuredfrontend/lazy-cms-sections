<script lang="ts">
	let { items }: { items: { q: string; a: string }[] } = $props();
	let open = $state<number | null>(null);
</script>

<section data-section="Accordion">
	<h2>FAQ</h2>
	{#each items as item, i (item.q)}
		<button data-testid="accordion-{i}" onclick={() => (open = open === i ? null : i)}>{item.q}</button>
		{#if open === i}<p>{item.a}</p>{/if}
	{/each}
</section>
