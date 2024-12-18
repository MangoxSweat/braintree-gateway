<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import braintree from 'braintree-web';

	let hostedFieldsInstance;
	let errorMessage = '';
	let successMessage = '';
	let amount = '10.00';
	let username = '';
	let cardholderName = '';

	onMount(() => {
		// Fetch client token from your server
		console.log('onmount payment component');
		axios
			.get('/api/braintree/get-token')
			.then((response) => {
				const token = response.data.clientToken;
				if (!token) {
					console.error('Client token is missing from the response');
					return;
				}

				// Create a Braintree client
				braintree.client.create({ authorization: token }, (clientErr, clientInstance) => {
					if (clientErr) {
						console.error('Error creating Braintree client:', clientErr);
						return;
					}
					console.log('Braintree client created successfully');

					// Create Hosted Fields
					braintree.hostedFields.create(
						{
							client: clientInstance,
							styles: {
								input: {
									'font-size': '14px',
									color: '#333',
									'font-family': 'Arial, sans-serif',
									padding: '10px'
								},
								'.number': {
									border: '1px solid #ccc',
									'border-radius': '4px',
									'background-color': 'white'
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
									placeholder: '4211 1111 1111 1111'
								},
								cvv: {
									selector: '#cvv',
									placeholder: '123'
								},
								expirationDate: {
									selector: '#expiration-date',
									placeholder: 'MM / YY'
								},
								postalCode: {
									selector: '#postal-code',
									placeholder: '11111'
								}
							}
						},
						(hostedFieldsErr, instance) => {
							if (hostedFieldsErr) {
								console.error('Error creating Hosted Fields:', hostedFieldsErr);
								return;
							}
							console.log('Hosted Fields created successfully');
							hostedFieldsInstance = instance;
							console.log('hosted fields instance', hostedFieldsInstance);
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

		if (!validateInputs()) {
			errorMessage = 'Please correct the errors in the form.';
			return;
		}

		hostedFieldsInstance.tokenize((tokenizeErr, payload) => {
			if (tokenizeErr) {
				errorMessage = 'Error requesting payment method: ' + tokenizeErr.message;
				return;
			}

			// Send nonce to your server for processing
			axios
				.post('/api/braintree/process-payment', {
					amount: parseFloat(amount),
					cardholderName: cardholderName,
					username: username,
					nonce: payload.nonce
				})
				.then((response) => {
					if (response.data.success) {
						successMessage =
							'Payment successful! Transaction ID: ' + response.data.result.transaction.id;
						errorMessage = '';
					} else {
						errorMessage = 'Payment failed: ' + response.data.result;
						successMessage = '';
					}
				})
				.catch((err) => {
					if (
						!err.response ||
						!err.response.data ||
						!err.response.data.result ||
						!err.response.data.result.success
					) {
						errorMessage = 'Error processing payment: ' + err.message;
					} else {
						errorMessage =
							'Error processing payment: ' + err.response.data.result.transaction.status;
					}
					successMessage = '';
				});
		});
	};

	const validateInputs = () => {
		let isValid = true;

		// Validate amount
		const amountInput = document.getElementById('amount');
		if (
			!/^\d+(\.\d{1,2})?$/.test(amountInput.value) ||
			parseFloat(amountInput.value) <= 0 ||
			parseFloat(amountInput.value) > 10000
		) {
			amountInput.classList.add('invalid');
			isValid = false;
		} else {
			amountInput.classList.remove('invalid');
			amountInput.classList.add('valid');
		}

		// Validate cardholder name
		const cardholderNameInput = document.getElementById('cardholder-name');
		if (cardholderNameInput.value.trim() === '') {
			cardholderNameInput.classList.add('invalid');
			isValid = false;
		} else {
			cardholderNameInput.classList.remove('invalid');
			cardholderNameInput.classList.add('valid');
		}

		console.log('Validation Status:', isValid);
		return isValid;
	};

	const formatExpirationDate = (event) => {
		let input = event.target.value.replace(/\D/g, '');
		if (input.length > 2) {
			input = input.slice(0, 2) + ' / ' + input.slice(2, 4);
		}
		event.target.value = input;
	}; // This function is defined but not used
</script>

<svelte:head>
	<script src="https://js.braintreegateway.com/web/3.97.3/js/client.min.js"></script>
	<script src="https://js.braintreegateway.com/web/3.97.3/js/hosted-fields.min.js"></script>
</svelte:head>

<form id="hosted-fields-form" method="post" on:submit={handlePayment}>
	<label for="username">Username</label><br />
	<input id="username" type="text" bind:value={username} placeholder="Username" />
	<br />
	<br />

	<label for="amount">Amount</label><br />
	<select id="amount" bind:value={amount} class="styled-select">
		<option value="10.00">$10.00</option>
		<option value="20.00">$20.00</option>
		<option value="40.00">$40.00</option>
		<option value="100.00">$100.00</option>
		<option value="200.00">$200.00</option>
	</select>

	<br />
	<br />
	<label for="cardholder-name">Cardholder Name</label><br />
	<input id="cardholder-name" type="text" bind:value={cardholderName} placeholder="Card Holder" />

	<br />
	<br />
	<label for="card-number">Card Number</label>
	<div id="card-number"></div>

	<label for="cvv">CVV</label>
	<div id="cvv"></div>

	<label for="expiration-date">Expiration Date</label>
	<div id="expiration-date"></div>

	<label for="postal-code">Postal Code</label>
	<div id="postal-code"></div>

	<div id="checkout-message"></div>

	<input id="payment-button" type="submit" value="Pay" />
</form>

{#if errorMessage}
	<p class="result-message" style="color: red;">{errorMessage}</p>
{/if}

{#if successMessage}
	<p class="result-message" style="color: green;">{successMessage}</p>
{/if}

<style>
	.result-message {
		margin: auto;
		width: 50%;
		text-align: center;
	}

	#card-number,
	#cvv,
	#expiration-date,
	#postal-code {
		margin-bottom: 20px;
		border-radius: 4px;
		padding: 10px;
		width: 85%;
		font-size: 16px;
	}

	/* General form styles */
	#hosted-fields-form {
		width: 33.33%; /* One third of the screen for desktops */
		margin: 0 auto; /* Center the form */
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		background-color: #f9f9f9; /* Light background color */
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
	}

	@media (max-width: 768px) {
		#hosted-fields-form {
			width: 80%; /* 80% of the screen for small screens */
		}
	}

	@media (max-width: 480px) {
		#hosted-fields-form {
			width: 100%; /* 100% of the screen for very small devices */
		}
	}

	/* Styles for each hosted field container */
	#card-number,
	#cvv,
	#expiration-date {
		margin-bottom: 15px; /* Space between fields */
	}

	/* Input styles */
	input {
		width: 92%;
		padding: 10px; /* Padding for input */
		font-size: 16px; /* Font size */
		border: 1px solid #ccc; /* Default border color */
		border-radius: 4px; /* Rounded corners */
		transition: border-color 0.3s ease; /* Smooth transition for border color */
		height: 40px;
	}

	/* Focus state styles */
	input:focus {
		border-color: #007bff; /* Change border color on focus */
		outline: none; /* Remove default outline */
	}

	form {
		width: 70%;
		margin: auto;
	}

	div#card-number,
	div#cvv,
	div#expiration-date,
	div#postal-code {
		height: 40px;
	}

	#card-number,
	#cvv,
	#expiration-date,
	#postal-code {
		width: 92%;
		background-color: white;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	#payment-button {
		width: 98%;
		cursor: pointer; /* Change cursor to hand pointer on hover */
	}

	#payment-button:active {
		background-color: #007bff; /* Change button color on press */
		color: white; /* Change text color to white for better contrast */
	}

	#payment-button:active {
		background-color: #007bff; /* Change button color on press */
		color: white; /* Change text color to white for better contrast */
	}
	.styled-select {
		width: 92%;
		padding: 10px;
		font-size: 16px;
		border: 1px solid #ccc;
		border-radius: 4px;
		background-color: white;
		transition: border-color 0.3s ease;
		height: 40px;
	}

	.styled-select:focus {
		border-color: #007bff;
		outline: none;
	}
</style>
