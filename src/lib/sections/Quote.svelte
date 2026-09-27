<script lang="ts">
	let { text, author }: { text: string; author: string } = $props();
</script>

<section data-section="Quote">
	<blockquote>{text}</blockquote>
	<cite>{author}</cite>
</section>
