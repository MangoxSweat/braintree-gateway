<script>
	import { onMount } from 'svelte';

	let paypalReady = false;

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
					layout: 'vertical',
					color: 'gold',
					label: 'paypal'
				},
				message: {
					amount: 100
				}
			})
			.render('#paypal-button-container');

		// Render each field after checking for eligibility
		const cardField = window.paypal.CardFields({
			createOrder: createOrderCallback,
			onApprove: onApproveCallback,
			style: {
				input: {
					'font-size': '16px',
					'font-family': 'courier, monospace',
					'font-weight': 'lighter',
					color: '#ccc'
				},
				'.invalid': { color: 'purple' }
			}
		});

		if (cardField.isEligible()) {
			const nameField = cardField.NameField({
				style: { input: { color: 'blue' }, '.invalid': { color: 'purple' } }
			});
			nameField.render('#card-name-field-container');

			const numberField = cardField.NumberField({
				style: { input: { color: 'blue' } }
			});
			numberField.render('#card-number-field-container');

			const cvvField = cardField.CVVField({
				style: { input: { color: 'blue' } }
			});
			cvvField.render('#card-cvv-field-container');

			const expiryField = cardField.ExpiryField({
				style: { input: { color: 'blue' } }
			});
			expiryField.render('#card-expiry-field-container');

			// Add click listener to submit button and call the submit function on the CardField component
			document.getElementById('card-field-submit-button').addEventListener('click', () => {
				cardField
					.submit({
						// From your billing address fields
						billingAddress: {
							addressLine1: document.getElementById('card-billing-address-line-1').value,
							addressLine2: document.getElementById('card-billing-address-line-2').value,
							adminArea1: document.getElementById('card-billing-address-admin-area-line-1').value,
							adminArea2: document.getElementById('card-billing-address-admin-area-line-2').value,
							countryCode: document.getElementById('card-billing-address-country-code').value,
							postalCode: document.getElementById('card-billing-address-postal-code').value
						}
					})
					.then(() => {
						// submit successful
					});
			});
		}
	}

	async function createOrderCallback() {
		resultMessage('');
		try {
			const response = await fetch('/api/paypal/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				// use the "body" param to optionally pass additional order information
				// like product ids and quantities
				body: JSON.stringify({
					cart: [
						{
							id: 'YOUR_PRODUCT_ID',
							quantity: 'YOUR_PRODUCT_QUANTITY'
						}
					]
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
			resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
		}
	}

	async function onApproveCallback(data, actions) {
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
				orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
				orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
			const errorDetail = orderData?.details?.[0];

			if (errorDetail || !transaction || transaction.status === 'DECLINED') {
				// (2) Other non-recoverable errors -> Show a failure message
				let errorMessage;
				if (transaction) {
					errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
				} else if (errorDetail) {
					errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
				} else {
					errorMessage = JSON.stringify(orderData);
				}

				throw new Error(errorMessage);
			} else {
				// (3) Successful transaction -> Show confirmation or thank you message
				// Or go to another URL:  actions.redirect('thank_you.html');
				resultMessage(
					`Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`
				);
				console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
			}
		} catch (error) {
			console.error(error);
			resultMessage(`Sorry, your transaction could not be processed...<br><br>${error}`);
		}
	}

	// Example function to show a result to the user. Your site's UI library can be used instead.
	function resultMessage(message) {
		const container = document.querySelector('#result-message');
		container.innerHTML = message;
	}

	// Load PayPal SDK
	onMount(() => {
		console.log('onmount');
		const script = document.createElement('script');
		script.src =
			'https://www.paypal.com/sdk/js?client-id=AdzwTEbAUluN_lm_NMdLozUJ5k6_TuURIOOuxsKDRX5bGC4EDsoTlmkrmXizRcot-x3PhlbKnZpjuLns&currency=USD&components=buttons,card-fields';
		script.onload = () => {
			console.log('onload');
			paypalReady = true; // Mark PayPal SDK as ready
			initPayPalButtons();
		};
		document.head.appendChild(script);
	});
</script>

<h1>Add Funds</h1>
<div id="paypal-button-container" class="paypal-button-container">
	<!-- Containers for Card Fields hosted by PayPal -->
	<div id="card-form" class="card_container">
		<div id="card-name-field-container"></div>
		<div id="card-number-field-container"></div>
		<div id="card-expiry-field-container"></div>
		<div id="card-cvv-field-container"></div>

		<div id="billing-address">
			<label for="card-billing-address-line-1">Billing Address</label>
			<input
				type="text"
				id="card-billing-address-line-1"
				name="card-billing-address-line-1"
				autocomplete="off"
				placeholder="Address line 1"
			/>
		</div>
		<div>
			<input
				type="text"
				id="card-billing-address-line-2"
				name="card-billing-address-line-2"
				autocomplete="off"
				placeholder="Address line 2"
			/>
		</div>
		<div>
			<input
				type="text"
				id="card-billing-address-admin-area-line-1"
				name="card-billing-address-admin-area-line-1"
				autocomplete="off"
				placeholder="Admin area line 1"
			/>
		</div>
		<div>
			<input
				type="text"
				id="card-billing-address-admin-area-line-2"
				name="card-billing-address-admin-area-line-2"
				autocomplete="off"
				placeholder="Admin area line 2"
			/>
		</div>
		<div>
			<input
				type="text"
				id="card-billing-address-country-code"
				name="card-billing-address-country-code"
				autocomplete="off"
				placeholder="Country code"
			/>
		</div>
		<div>
			<input
				type="text"
				id="card-billing-address-postal-code"
				name="card-billing-address-postal-code"
				autocomplete="off"
				placeholder="Postal/zip code"
			/>
		</div>
		<br /><br />
		<button id="card-field-submit-button" type="button"> Pay now with Card </button>
	</div>
	<p id="result-message"></p>
</div>

<div id="form-images">
	<img src="/secure.png" id="secure-image" alt="Secure payments" />
</div>
{#if paypalReady}{:else}
	<p>Loading PayPal...</p>
{/if}

<style>
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
	.paypal-button-container {
		margin-top: 20px;
	}
	.card_container {
		width: 80%;
		margin: 0 auto;
		padding: 1em;
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
		width: 100%;
		padding: 0.5em;
		border: 1px solid rgba(12, 48, 91, 0.2);
		border-radius: 4px;
		font-family: 'Cairo', sans-serif;
	}
	#card-field-submit-button {
		width: 100%;
		padding: 1em;
		background: rgba(12, 48, 91, 1);
		color: white;
		border: none;
		border-radius: 4px;
		font-family: 'Cairo', sans-serif;
		font-weight: 600;
		cursor: pointer;
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
</style>
