<script lang="ts">
	let { images }: { images: { src: string; alt: string }[] } = $props();
	let active = $state(0);
</script>

<section data-section="Gallery">
	<h2>Gallery</h2>
	<div class="stage">{images[active].alt}</div>
	<button data-testid="gallery-next" onclick={() => (active = (active + 1) % images.length)}>
		Next ({active + 1}/{images.length})
	</button>
</section>

<style>
	.stage { height: 160px; display: grid; place-items: center; background: #f0f3f6; border-radius: 12px; }
</style>
