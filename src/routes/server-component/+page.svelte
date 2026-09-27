<script lang="ts">
	import SectionList from '$lib/SectionList.svelte';
	let { data } = $props();
</script>

<SectionList sections={data.sections} />
