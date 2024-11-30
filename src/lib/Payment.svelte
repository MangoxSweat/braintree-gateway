<script>
	import { onMount } from 'svelte';
	import axios from 'axios';

	let hostedFieldsInstance;
	let errorMessage = '';
	let successMessage = '';
	let amount = '10.00';
	let username = '';
	let cardholderName = '';

	onMount(() => {
		// Fetch client token from your server
		axios
			.get('http://localhost:3000/get-token')
			.then((response) => {
				const token = response.data.clientToken;
				if (!token) {
					console.error('Client token is missing from the response');
					return;
				}

				// Create a Braintree client
				braintree.client.create({ authorization: token }, (clientErr, clientInstance) => {
					if (clientErr) {
						console.error(clientErr);
						return;
					}

					// Create Hosted Fields
					braintree.hostedFields.create(
						{
							client: clientInstance,
							styles: {
								input: {
									'font-size': '16px',
									color: '#333',
									'font-family': 'Arial, sans-serif',
									padding: '10px',
									border: '1px solid #ccc',
									'border-radius': '4px'
								},
								'.valid': {
									color: 'green'
								},
								'.invalid': {
									color: 'red'
								}
							},
							fields: {
								number: {
									selector: '#card-number',
									placeholder: '4111 1111 1111 1111'
								},
								cvv: {
									selector: '#cvv',
									placeholder: '123'
								},
								expirationDate: {
									selector: '#expiration-date',
									placeholder: 'MM / YY'
								}
							}
						},
						(hostedFieldsErr, instance) => {
							if (hostedFieldsErr) {
								console.error(hostedFieldsErr);
								return;
							}
							hostedFieldsInstance = instance;
						}
					);
				});
			})
			.catch((err) => {
				console.error('Error fetching client token:', err);
			});
	});

	const handlePayment = (event) => {
		event.preventDefault(); // Prevent default form submission

		hostedFieldsInstance.tokenize((tokenizeErr, payload) => {
			if (tokenizeErr) {
				errorMessage = 'Error requesting payment method: ' + tokenizeErr.message;
				return;
			}

			// Send nonce to your server for processing
			axios
				.post('http://localhost:3000/process-payment', {
					nonce: payload.nonce,
					amount: amount
				})
				.then((response) => {
					if (response.data.success) {
						successMessage = 'Payment successful! Transaction ID: ' + response.data.transaction.id;
						errorMessage = '';
					} else {
						errorMessage = 'Payment failed: ' + response.data.message;
						successMessage = '';
					}
				})
				.catch((err) => {
					errorMessage = 'Error processing payment: ' + err.message;
					successMessage = '';
				});
		});
	};
</script>

<svelte:head>
	<script src="https://js.braintreegateway.com/web/3.97.3/js/client.min.js"></script>
	<script src="https://js.braintreegateway.com/web/3.97.3/js/hosted-fields.min.js"></script>
</svelte:head>

<form id="payment-form" on:submit={handlePayment}>
	<label for="username">Username</label>
	<input type="text" id="username" bind:value={username} placeholder="Username" required />

	<br />
	<br />
	<label for="amount">Amount</label>
	<input type="text" id="amount" bind:value={amount} placeholder="10.00" required />

	<br />
	<br />
	<label for="cardholder-name">Cardholder Name</label>
	<input
		type="text"
		id="cardholder-name"
		bind:value={cardholderName}
		placeholder="John Doe"
		required
	/>

	<br />
	<br />
	<label for="card-number">Card Number</label>
	<input type="text" id="card-number" placeholder="4111111111111111" />

	<br />
	<label for="cvv">CVV</label>
	<input id="cvv" type="text" placeholder="CVV" />

	<br />
	<label for="expiration-date">Expiration Date</label>
	<input type="text" id="expiration-date" placeholder="MM / YY" />

	<button type="submit">Pay</button>
</form>

{#if errorMessage}
	<p style="color: red;">{errorMessage}</p>
{/if}

{#if successMessage}
	<p style="color: green;">{successMessage}</p>
{/if}

<style>
	#card-number,
	#cvv,
	#expiration-date {
		margin-bottom: 20px;
		border-radius: 4px;
		padding: 10px;
		width: 85%;
		font-size: 16px;
	}

	/* General form styles */
	#payment-form {
		max-width: 400px; /* Set a max width for the form */
		margin: 0 auto; /* Center the form */
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		background-color: #f9f9f9; /* Light background color */
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
	}

	/* Styles for each hosted field container */
	#card-number,
	#cvv,
	#expiration-date {
		margin-bottom: 15px; /* Space between fields */
	}

	/* Input styles */
	input {
		width: 85%; /* Full width */
		padding: 10px; /* Padding for input */
		font-size: 16px; /* Font size */
		border: 1px solid #ccc; /* Default border color */
		border-radius: 4px; /* Rounded corners */
		transition: border-color 0.3s ease; /* Smooth transition for border color */
	}

	/* Focus state styles */
	input:focus {
		border-color: #007bff; /* Change border color on focus */
		outline: none; /* Remove default outline */
	}

	/* Valid state styles (for valid inputs) */
	.valid {
		border-color: green; /* Green border for valid inputs */
	}

	/* Invalid state styles (for invalid inputs) */
	.invalid {
		border-color: red; /* Red border for invalid inputs */
	}

	/* Button styles */
	button {
		width: 100%; /* Full width button */
		padding: 10px;
		background-color: #007bff; /* Primary button color */
		color: white; /* Text color */
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
	}

	button:hover {
		background-color: #0056b3; /* Darker shade on hover */
	}

	input,
	button {
		transition: all 0.3s ease-in-out;
	}

	input:hover,
	button:hover {
		transform: scale(1.02); /* Slightly enlarge on hover */
	}
</style>
