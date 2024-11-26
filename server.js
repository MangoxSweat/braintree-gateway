import express from 'express';
import bodyParser from 'body-parser';
import braintree from 'braintree';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 3000;

// Configure Braintree Gateway
const gateway = new braintree.BraintreeGateway({
	environment: braintree.Environment.Sandbox,
	merchantId: process.env.BRAINTREE_MERCHANT_ID,
	publicKey: process.env.BRAINTREE_PUBLIC_KEY,
	privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint to get client token
app.get('/get-token', (req, res) => {
	console.log('Received request for client token');
	gateway.clientToken.generate({}, (err, response) => {
		if (err) {
			console.error('Error generating client token:', err);
			return res.status(500).send({ error: err.message });
		}
		console.log('Generated client token:', response.clientToken);
		res.send({ clientToken: response.clientToken });
	});
});

// Endpoint to process payment
app.post('/process-payment', (req, res) => {
	const { nonce, amount, cardholderName } = req.body;

	gateway.transaction.sale(
		{
			amount: amount,
			paymentMethodNonce: nonce,
			options: { submitForSettlement: true },
			billing: {
				name: cardholderName
			}
		},
		(err, result) => {
			if (err) return res.status(500).send(err);
			if (result.success) {
				// Call the external API to add payment
				const axios = require('axios');
				const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
				const apiUrl = 'https://igmorefollowers.com/adminapi/v2/payments/add';
				const paymentData = {
					username: 'john', // Replace with actual username
					amount: amount,
					method: 'Perfect Money USD', // Replace with actual method
					memo: 'added via Admin API',
					affiliate_commission: true
				};
				axios
					.post(apiUrl, paymentData, {
						headers: {
							'Content-Type': 'application/json',
							'X-Api-Key': apiKey
						}
					})
					.then((apiResponse) => {
						console.log('Payment added successfully:', apiResponse.data);
						res.send(result);
					})
					.catch((apiError) => {
						console.error('Error adding payment:', apiError);
						res.status(500).send({ error: 'Payment processed but failed to add payment to panel' });
					});
			} else {
				res.status(500).send(result);
			}
		}
	);
});

// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
