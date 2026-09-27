<script lang="ts">
	let { heading, body }: { heading: string; body: string } = $props();
</script>

<section data-section="TextBlock">
	<h2>{heading}</h2>
	<p>{body}</p>
</section>
