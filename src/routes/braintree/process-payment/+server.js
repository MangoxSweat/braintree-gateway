import axios from 'axios';
import dotenv from 'dotenv';
import { json } from '@sveltejs/kit';
import { BraintreeGateway, Environment } from 'braintree';

dotenv.config();

const gateway = new BraintreeGateway({
	environment: Environment.Sandbox,
	merchantId: process.env.BRAINTREE_MERCHANT_ID,
	publicKey: process.env.BRAINTREE_PUBLIC_KEY,
	privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

async function addPayment(amt, user, meth) {
	const url = 'https://igmorefollowers.com/adminapi/v2/payments/add';
	const data = {
		username: user,
		amount: amt,
		method: meth,
		memo: 'added via Admin API',
		affiliate_commission: false
	};
	const headers = {
		'Content-Type': 'application/json',
		'X-Api-Key': process.env.IGMORE_API_KEY
	};

	try {
		const response = await axios.post(url, data, { headers });
		console.log('Added payment to igmorefollowers admin panel', response.data);
	} catch (error) {
		console.error(
			'Error adding payment igmorefollowers:',
			error.response ? error.response.data : error.message
		);
		throw new Error('Failed to add payment');
	}
}

async function verifyUser(username) {
	try {
		if (!username) {
			console.log('No username provided');
			throw new Error('No username provided');
			return false;
		}

		const url = `https://igmorefollowers.com/adminapi/v2/users?username=${username}`;
		const headers = {
			'X-Api-Key': process.env.IGMORE_API_KEY
		};

		const response = await axios.get(url, { headers });
		if (response.data.data.count === 0) {
			console.error('User not found');
			throw new Error('Username not found');
			return false;
		}

		console.log('username valid');
		return true;
	} catch (error) {
		console.error('Error verifying user:', error.response ? error.response.data : error.message);
		if (error.message) {
			throw new Error(error.message);
		} else {
			throw new Error('Failed to verify user');
		}
	}
}

const saleTransaction = (saleData) =>
	new Promise((resolve, reject) => {
		gateway.transaction.sale(saleData, (err, result) => {
			if (err) return reject(err);
			resolve(result);
		});
	});

export async function POST({ request }) {
	console.log('Received request to process payment');

	try {
		const { nonce, amount, cardholderName, username } = await request.json();
		if (await verifyUser(username)) {
			amount += 4;
			const result = await saleTransaction({
				amount: amount.toString(),
				paymentMethodNonce: nonce,
				options: { submitForSettlement: true },
				billing: {
					firstName: cardholderName
				}
			});

			if (result.success) {
				console.log('Payment successful:', result.transaction.paymentReceipt.currencyIsoCode);
				await addPayment(
					amount,
					username,
					'Perfect Money ' + result.transaction.paymentReceipt.currencyIsoCode
				);
				return json({ success: true, result });
			} else {
				throw new Error('Payment unsuccessful: ' + result.message);
			}
		}
	} catch (error) {
		console.error('Error processing payment:', error.message);
		return json({ error: error.message }, { status: 500 });
	}
}
