<script lang="ts">
	let { title, subtitle }: { title: string; subtitle: string } = $props();
	let likes = $state(0);
</script>

<section data-section="Hero" class="hero">
	<h1>{title}</h1>
	<p>{subtitle}</p>
	<button data-testid="hero-btn" onclick={() => likes++}>Like ({likes})</button>
</section>

<style>
	.hero { padding: 3rem 1.5rem; background: #0e1116; color: #e6edf3; border-radius: 12px; }
	h1 { margin: 0 0 0.5rem; font-size: 2.2rem; }
</style>
