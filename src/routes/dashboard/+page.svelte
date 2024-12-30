<script>
	import { onMount } from 'svelte';
	let { data } = $props();
	data.logs = data.logs || [];

	function getLogColor(level) {
		switch (level) {
			case 'error':
			case 50:
				return 'red';
			case 'warn':
			case 40:
				return 'green';
			case 'info':
			case 30:
				return 'blue';
			case 'debug':
			case 20:
				return 'orange';
			default:
				return 'black';
		}
	}
	console.log('logs', data.logs);
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<h1>Admin Dashboard</h1>
<h2>handsfreepay payment log</h2>
<hr />

{#if data.logs && data.logs.length > 0}
	{#each data.logs.map((log) => ({ ...log, time: new Date(log.time).toLocaleString() })) as log}
		{#if log.level === 30}
			<pre
				style="color: {getLogColor(
					log.level
				)}">{log.time} - {log.msg} - Transaction: {log.paypal_id} - Amount: {log.amount} - Username: {log.username}</pre>
		{/if}
		{#if log.level === 40}
			<pre
				style="color: {getLogColor(
					log.level
				)}">{log.time} - {log.msg} for {log.username} for ${log.amount} - Transaction: {log.paypal_id}</pre>
		{/if}
		{#if log.level > 50}
			<pre
				style="color: {getLogColor(
					log.level
				)}">{log.time} - {log.msg} for {log.username} for {log.amount}</pre>
		{/if}
	{/each}
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
