<script>
	import { onMount } from 'svelte';

	onMount(() => {});

	function checkAuth() {
		// Implement your authentication logic here
		// For example, check if a token exists in localStorage
		return localStorage.getItem('authToken') !== null;
	}
</script>

<main>
	<h1>Data from load function</h1>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</main>
