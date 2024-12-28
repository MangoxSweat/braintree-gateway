<script>
	import { onMount } from 'svelte';
	import pino from 'pino';
	let paypalReady = false;

	let cardBillingAddressLine1 = '';
	let cardBillingAddressLine2 = '';
	let cardBillingAddressAdminAreaLine1 = '';
	let cardBillingAddressAdminAreaLine2 = '';
	let cardBillingAddressCountryCode = '';
	let cardBillingAddressPostalCode = '';
	let cardField;
	let cardFieldSubmitButton;
	let amount = '10';
	let username;

	$: paypalReady && initPayPalButtons();

	// Function to initialize PayPal buttons
	function initPayPalButtons() {
		console.log('initPayPalButtons');
		paypal
			.Buttons({
				// Sets up the transaction when a payment button is clicked
				createOrder: createOrderCallback,
				onApprove: onApproveCallback,
				onError: function (error) {
					// Do something with the error from the SDK
				},
				style: {
					shape: 'rect',
					layout: 'horizontal',
					color: 'gold',
					label: 'paypal'
				},
				message: {
					amount: amount
				}
			})
			.render('#paypal-button-container');

		// Render each field after checking for eligibility
		cardField = window.paypal.CardFields({
			createOrder: createOrderCallback,
			onApprove: onApproveCallback,
			style: {
				input: {
					'font-size': '14px',
					'font-family': 'Cairo, sans-serif',
					'font-weight': 'normal',
					color: '#ccc'
				},
				'.invalid': { color: 'red' }
			}
		});

		if (cardField.isEligible()) {
			const nameField = cardField.NameField({
				style: {
					input: {
						color: 'dark blue',
						'font-family': 'Cairo, sans-serif',
						'font-size': '14px',
						background: 'rgb(233, 242, 252)'
					},
					'.invalid': { color: 'red' }
				}
			});
			nameField.render('#card-name-field-container');

			const numberField = cardField.NumberField({
				style: {
					input: {
						background: 'rgb(233, 242, 252)',
						color: 'dark blue',
						'font-size': '14px',
						'font-family': 'Cairo, sans-serif'
					},
					'.invalid': { color: 'red' }
				}
			});
			numberField.render('#card-number-field-container');

			const cvvField = cardField.CVVField({
				style: {
					input: {
						background: 'rgb(233, 242, 252)',
						color: 'dark blue',
						'font-size': '14px',
						'font-family': 'Cairo, sans-serif'
					},
					'.invalid': { color: 'red' }
				}
			});
			cvvField.render('#card-cvv-field-container');

			const expiryField = cardField.ExpiryField({
				style: {
					input: {
						background: 'rgb(233, 242, 252)',
						color: 'dark blue',
						'font-size': '14px',
						'font-family': 'Cairo, sans-serif'
					},
					'.invalid': { color: 'red' }
				}
			});
			expiryField.render('#card-expiry-field-container');
		}
	}

	// Add click listener to submit button and call the submit function on the CardField component
	const submitCardField = async () => {
		console.log('Submitting card field...');
		cardFieldSubmitButton.disabled = true; // Disable the button
		try {
			const response = await cardField
				.submit({
					contingencies: ['3D_SECURE'], // Enable 3D Secure if applicable
					paymentSource: {
						card: {
							billingAddress: {
								address_line_1: cardBillingAddressLine1, // Corrected casing
								address_line_2: cardBillingAddressLine2,
								admin_area_1: cardBillingAddressAdminAreaLine1,
								admin_area_2: cardBillingAddressAdminAreaLine2,
								country_code: cardBillingAddressCountryCode,
								postal_code: cardBillingAddressPostalCode
							}
						}
					},
					verification: {
						method: 'SCA_ALWAYS'
					},
					username: username
				})
				.then(() => {
					//submit successful
					console.log('submit successful');

					// Clear form fields
					username = '';
					cardBillingAddressLine1 = '';
					cardBillingAddressLine2 = '';
					cardBillingAddressAdminAreaLine1 = '';
					cardBillingAddressAdminAreaLine2 = '';
					cardBillingAddressCountryCode = '';
					cardBillingAddressPostalCode = '';
					amount = '10';

					// Clear input fields
					document.getElementById('username').value = '';
					document.getElementById('amount').value = '10';
				});
		} catch (error) {
			console.error('Error submitting card field:', error);
			// Handle error (e.g., show error message to the user)
		} finally {
			cardFieldSubmitButton.disabled = false; // Re-enable the button
		}
	};

	async function createOrderCallback(data, actions) {
		console.log('create callback');
		try {
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					intent: 'CAPTURE',
					contingencies: ['3D_SECURE'], // Enable 3D Secure if applicable
					verification: {
						method: 'SCA_ALWAYS'
					},
					purchase_units: [
						{
							amount: {
								currency_code: 'USD',
								value: amount
							}
						}
					],
					username: username,
					amount: amount
				})
			});

			const orderData = await response.json();

			if (orderData.id) {
				return orderData.id;
			} else {
				const errorDetail = orderData?.details?.[0];
				const errorMessage = errorDetail
					? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
					: JSON.stringify(orderData);

				throw new Error(errorMessage);
			}
		} catch (error) {
			console.error(error);
			resultMessage(`Could not initiate PayPal Checkout...<br><br>${error.message}`, 'red');
		}
	}

	async function onApproveCallback(data, actions) {
		console.log('approve callback');
		try {
			const response = await fetch(`/api/orders/${data.orderID}/capture`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const orderData = await response.json();
			// Three cases to handle:
			//   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
			//   (2) Other non-recoverable errors -> Show a failure message
			//   (3) Successful transaction -> Show confirmation or thank you message

			const transaction =
				orderData?.jsonResponse?.purchase_units?.[0]?.payments?.captures?.[0] ||
				orderData?.jsonResponse?.purchase_units?.[0]?.payments?.authorizations?.[0];
			const errorDetail = orderData?.details?.[0];

			console.log('transaction: ', orderData);

			if (errorDetail || !transaction || transaction.status === 'DECLINED') {
				// (2) Other non-recoverable errors -> Show a failure message
				let errorMessage;
				if (transaction) {
					console.log('outcome 2');
					errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
				} else if (errorDetail) {
					errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
				} else {
					console.log('outcome 1');
					errorMessage = JSON.stringify(orderData.body);
				}

				throw new Error(errorMessage);
			} else {
				console.log('outcome 3');
				const updateBalance = await fetch('/api/igmorefollowers/updateBalance', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						username: username,
						amount: amount,
						transaction: transaction.id
					})
				});

				const response = await updateBalance.json();
				if (response.body.error) {
					throw new Error(response.body.error);
				}

				resultMessage(
					`Transaction ${transaction.status}: ${transaction.id}<br><br>${response.body.success}.`,
					'green'
				);
				console.log('Capture result', orderData.body, JSON.stringify(orderData.body, null, 2));
			}
		} catch (error) {
			console.error(error);
			resultMessage(`Sorry, your transaction could not be processed...<br><br>${error}`, 'red');
		}
	}

	// Example function to show a result to the user. Your site's UI library can be used instead.
	function resultMessage(message, color) {
		const container = document.querySelector('#result-message');
		container.innerHTML = message;
		container.style.borderColor = color;
		container.style.borderWidth = '3px';
		container.style.borderStyle = 'solid';
	}

	// Load PayPal SDK
	onMount(() => {
		console.log('onmount');
		const script = document.createElement('script');
		script.src =
			'https://www.sandbox.paypal.com/sdk/js?client-id=AdzwTEbAUluN_lm_NMdLozUJ5k6_TuURIOOuxsKDRX5bGC4EDsoTlmkrmXizRcot-x3PhlbKnZpjuLns&components=buttons,card-fields&enable-funding=venmo';

		//script.src =('https://www.paypal.com/sdk/js?client-id=Adb7Xn3r_1RTRD9iUNMS92Ad3nuz1FmW-Gl0kBwLfkZCl29PeX64UcMqppn4t6nTKv1z_z18WeXiLLO0&components=buttons,card-fields&enable-funding=venmo');
		script.setAttribute('data-sdk-integration-source', 'developer-studio');
		script.onload = () => (paypalReady = true);
		document.head.appendChild(script);
	});
</script>

<main>
	<h1>Add Funds</h1>
	<!-- Containers for Card Fields hosted by PayPal -->
	<div id="card-form" class="card_container">
		<div style:text-align="center">
			<label for="username">Username</label>
			<input
				type="text"
				id="username"
				name="username"
				autocomplete="off"
				placeholder="Enter username"
				bind:value={username}
			/>
		</div>
		<div style:display="block">
			<label style:width="100%" for="amount">Amount</label>
			<select
				id="amount"
				name="amount"
				bind:value={amount}
				on:change={(e) => (amount = e.target.value)}
			>
				<option value="10">$10</option>
				<option value="20">$20</option>
				<option value="50">$50</option>
				<option value="100">$100</option>
				<option value="200">$200</option>
			</select>
		</div>
		<label style:width="100%">Payment Info</label>
		<div id="card-name-field-container"></div>
		<div id="card-number-field-container"></div>
		<div id="card-expiry-field-container"></div>
		<div id="card-cvv-field-container"></div>
		<!--
		<div id="billing-address" style:margin-top="1em">
			<label for="card-billing-address-line-1">Billing Address</label>
			<input
				type="text"
				id="card-billing-address-line-1"
				name="card-billing-address-line-1"
				autocomplete="off"
				placeholder="Address line 1"
				bind:value={cardBillingAddressLine1}
			/>
		</div>
		<div style:text-align="center">
			<input
				type="text"
				id="card-billing-address-line-2"
				name="card-billing-address-line-2"
				autocomplete="off"
				placeholder="Address line 2"
				bind:value={cardBillingAddressLine2}
			/>
		</div>
		<div style:text-align="center">
			<input
				type="text"
				id="card-billing-address-admin-area-line-1"
				name="card-billing-address-admin-area-line-1"
				autocomplete="off"
				placeholder="Admin area line 1"
				bind:value={cardBillingAddressAdminAreaLine1}
			/>
		</div>
		<div style:text-align="center">
			<input
				type="text"
				id="card-billing-address-admin-area-line-2"
				name="card-billing-address-admin-area-line-2"
				autocomplete="off"
				placeholder="Admin area line 2"
				bind:value={cardBillingAddressAdminAreaLine2}
			/>
		</div>
		<div style:text-align="center">
			<input
				type="text"
				id="card-billing-address-country-code"
				name="card-billing-address-country-code"
				autocomplete="off"
				placeholder="Country code"
				bind:value={cardBillingAddressCountryCode}
			/>
		</div>
		<div style:text-align="center">
			<input
				type="text"
				id="card-billing-address-postal-code"
				name="card-billing-address-postal-code"
				autocomplete="off"
				placeholder="Postal/zip code"
				bind:value={cardBillingAddressPostalCode}
			/>
		</div>
        -->
		<br /><br />
		<button
			id="card-field-submit-button"
			type="button"
			on:click={submitCardField}
			bind:this={cardFieldSubmitButton}
		>
			Pay</button
		>
	</div>
	<p id="result-message"></p>

	<div id="paypal-button-container" class="paypal-button-container"></div>
</main>

<style>
	#result-message {
		padding: 1em;
	}
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	#secure-image {
		width: 20%;
	}
	:global(body) {
		background-color: rgba(233, 242, 252, 1);
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
	#card-name-field-container,
	#card-number-field-container,
	#card-cvv-field-container,
	#card-expiry-field-container {
		width: 97%;
		margin: auto;
	}
	.paypal-button-container {
		margin: auto;
		margin-top: 20px;
		width: 45vw;
	}
	.card_container {
		width: 40%;
		margin: 0 auto;
		padding: 2em;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
	.card_container div {
		margin-bottom: 1em;
	}
	.card_container label {
		display: block;
		margin-bottom: 0.5em;
		color: rgba(12, 48, 91, 1);
		font-family: 'Cairo', sans-serif;
		font-weight: 600;
	}
	.card_container input {
		background-color: rgb(233, 242, 252);
		width: 95%;
		border: 0.0625rem solid #909697;
		border-radius: 5px;
		font-family: 'Cairo', sans-serif;
		font-size: 14px;
		padding: 1em;
		height: 40px;
	}
	.card_container div label {
		float: left;
	}

	#card-field-submit-button {
		width: 100%;
		padding: 1em;
		background-color: rgba(30, 121, 228, 1);
		color: white;
		border: none;
		border-radius: 4px;
		font-family: 'Cairo', sans-serif;
		font-weight: 600;
		cursor: pointer;
		height: 40px;
	}
	#card-field-submit-button:hover {
		background: rgba(12, 48, 91, 0.8);
	}
	#result-message {
		text-align: center;
		color: rgba(12, 48, 91, 1);
		font-family: 'Cairo', sans-serif;
		margin-top: 1em;
	}

	.card-field-number {
		background-color: rgb(233, 242, 252);
	}

	#billing-address {
		text-align: center;
	}

	/* Media Queries for Mobile Responsiveness */
	@media (max-width: 600px) {
		h1 {
			font-size: 1.5em;
			padding-top: 1em;
		}
		.card_container {
			width: 90%;
			padding: 0.5em;
		}
		.card_container input {
			padding: 0.4em;
		}
		#card-field-submit-button {
			padding: 0.8em;
		}
		#secure-image {
			width: 50%;
		}
		.paypal-button-container {
			width: 90vw;
		}
	}

	/* Media Queries for Tablet Responsiveness */
	@media (min-width: 601px) and (max-width: 1024px) {
		.paypal-button-container {
			width: 90vw;
		}
		h1 {
			font-size: 2em;
			padding-top: 1.5em;
		}
		.card_container {
			width: 80%;
			padding: 0.75em;
		}
		.card_container input {
			padding: 0.5em;
		}
		#card-field-submit-button {
			padding: 0.9em;
		}
		#secure-image {
			width: 30%;
		}
	}

	#amount {
		background: rgb(233, 242, 252);
		height: 50px;
		width: 30%;
		color: #333;
		padding: 1em;
		border-radius: 5px;
		margin: 0em 1.5em;
		border: 0.0625rem solid #909697;
	}
</style>
