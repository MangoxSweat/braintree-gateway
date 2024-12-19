<script>
	import BraintreeFields from '$lib/components/BraintreeFields.svelte';
	import { onMount } from 'svelte';
	onMount(() => {
		console.log('page onmount');
	});
</script>

<main>
	<h1>Pay Here!</h1>
	<BraintreeFields />
</main>

<style>
	h1 {
		margin: 10px auto;
		width: 80%;
		text-align: center;
		color: rgba(12, 48, 91, 1);
		font-family: 'Cairo', sans-serif;
		font-style: normal;
		font-weight: 600;
	}
	/* Add your global styles here */

	main {
		background: rgba(233, 242, 252, 1);
		height: 100vh;
		padding: 10vh 0;
	}
</style>
