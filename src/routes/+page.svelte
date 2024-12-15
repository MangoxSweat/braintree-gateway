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
	}
	/* Add your global styles here */
</style>
