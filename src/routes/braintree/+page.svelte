<script>
	import BraintreeFields from '$lib/components/BraintreeFields.svelte';
	import { onMount } from 'svelte';
	onMount(() => {
		console.log('page onmount');
	});
</script>

<main>
	<h1>Add funds</h1>
	<BraintreeFields />
	<div id="form-images">
		<img src="/secure.png" id="secure-image" alt="Secure payments" />
	</div>
</main>

<style>
	:global(body) {
		background-color: rgba(233, 242, 252, 1);
	}
	#form-images {
		width: 100vw;
		text-align: center;
		padding: 1em 0;
	}
	img#secure-image {
		width: 10vw;
		display: inline-block;
	}
	h1 {
		padding-top: 2em;
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
		flex-direction: column;
		justify-content: center;
	}
</style>
