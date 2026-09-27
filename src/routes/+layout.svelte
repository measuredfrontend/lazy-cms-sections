<script lang="ts">
	import { onMount } from 'svelte';
	let { children } = $props();

	// The root layout's onMount runs once the whole page has hydrated.
	// The measure script reads this timestamp.
	onMount(() => {
		(window as any).__hydratedAt = performance.now();
		document.documentElement.dataset.hydrated = 'true';
	});
</script>

<nav>
	<a href="/">Home</a> ·
	<a href="/universal">1. Universal load (hybrid)</a> ·
	<a href="/static">2. Static map</a> ·
	<a href="/await-in-template">3. {'{#await}'} in template</a> ·
	<a href="/onmount">4. onMount</a>
</nav>

<main>{@render children()}</main>

<style>
	:global(body) { font-family: system-ui, sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; }
	nav { margin-bottom: 1.5rem; font-size: 0.9rem; }
	main { display: grid; gap: 1.5rem; }
</style>
