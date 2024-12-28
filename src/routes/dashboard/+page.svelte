<script>
	import { onMount } from 'svelte';
	import { goto } from '@sveltejs/kit/navigation';

	onMount(() => {
		const isAuthenticated = checkAuth(); // Replace with your actual authentication check
		if (!isAuthenticated) {
			goto('/login'); // Redirect to login page if not authenticated
		}
	});

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
