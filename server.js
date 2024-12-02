import express from 'express';
import bodyParser from 'body-parser';
import braintree from 'braintree';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

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
app.use(express.static('build')); // Serve the build folder of the Svelte project

// Endpoint to get client token
app.get('/get-token', (req, res) => {
	console.log('Received request for client token');
	gateway.clientToken.generate({}, (err, response) => {
		if (err) {
			console.error('Error generating client token:', err);
			return res.status(500).send({ error: err.message });
		}
		console.log('generate token: ', response.clientToken);
		res.send({ clientToken: response.clientToken });
	});
});

// Endpoint to process payment
app.post('/process-payment', (req, res) => {
	console.log('Received request to process payment', req.body);

	const { nonce, amount, cardholderName, username, cvv } = req.body;
	console.log('request', req.body);

	// Proceed with payment without validating username
	gateway.transaction.sale(
		{
			amount: amount.toString(),
			paymentMethodNonce: 'fake-valid-nonce',
			options: { submitForSettlement: true },
			billing: {
				firstName: cardholderName
			}
		},
		(err, result) => {
			if (err) {
				console.error('Error processing transaction:', err);
				return res.status(500).send({ error: err.message });
			}
			if (result.success) {
				//console.log('Payment successful:', result);
				console.log('Payment successful:');
				res.send(result);
			} else {
				console.error('Payment unsuccessful:');
				res.status(500).send({ error: 'Payment unsuccessful' });
			}
		}
	);
});

// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
