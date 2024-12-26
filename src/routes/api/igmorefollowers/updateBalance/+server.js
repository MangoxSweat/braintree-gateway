import { json } from '@sveltejs/kit';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function addPayment(amt, user, meth) {
	console.log('add payment igmorefollowers');
	const url = 'https://igmorefollowers.com/adminapi/v2/payments/add';
	const body = {
		username: user,
		amount: amt,
		method: 'Perfect Money USD',
		memo: 'added via Admin API',
		affiliate_commission: false
	};
	const headers = {
		'Content-Type': 'application/json',
		'X-Api-Key': process.env.IGMORE_API_KEY
	};

	try {
		console.log('update amount: ', amt);
		const response = await axios.post(url, body, { headers });

		if (response.error_code) {
			throw new Error(response.error_message);
		}

		console.log('Updated balance to: ', response.data.data.user.balance);
		return response.data.data.user.balance;
	} catch (error) {
		console.error('Error adding payment igmorefollowers:', error.message);
		throw new Error('Failed to add payment');
	}
}

export async function POST({ request }) {
	try {
		const { username, amount } = await request.json();

		const balance = await addPayment(amount, username, 'USD');

		return json({
			status: 200,
			body: { success: `Your balance successfully updated to ${balance}` }
		});
	} catch (error) {
		console.error('Failed to capture order:', error);
		return json({
			status: 500,
			body: { error: `Failed to capture order - ${error}` }
		});
	}
}
