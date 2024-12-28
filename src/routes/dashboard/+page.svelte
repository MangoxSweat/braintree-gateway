<script>
	import { onMount } from 'svelte';
	let { data } = $props();
	onMount(() => {});
</script>

<h1>Dashboard</h1>
<h2>igmorefollowers payment log</h2>
<hr />
{#if data.logs}
	<pre>{data.logs}</pre>
{:else}
	<p>No logs available.</p>
{/if}

<style>
	:global(body) {
		background-color: rgb(233, 242, 252);
		text-align: center;
	}
	pre {
		background-color: #f4f4f4;
		padding: 1em;
		border-radius: 5px;
		overflow-x: auto;
		margin: auto;
		width: 90%;
	}
</style>
