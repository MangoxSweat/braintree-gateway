// src/routes/api/orders/[orderID]/capture.js
import { json } from '@sveltejs/kit';
import axios from 'axios';
import { ApiError } from '@paypal/paypal-server-sdk';
import { ordersController } from '$lib/paypal.js';
import dotenv from 'dotenv';
import { getLogger } from '$lib/logger';
dotenv.config();

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const logger = await getLogger();

async function addPayment(amt, user, trans) {
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
		const response = await axios.post(url, body, { headers });

		if (response.error_code) {
			throw new Error(response.error_message);
		}
		let balance = response.data.data.user.balance;

		logger.warn(
			{ paypal_id: trans, username: user, amount: amt, updated_balance: balance },
			`IGMOREFOLLOWERS balance update`
		);
		return balance;
	} catch (error) {
		logger.error(
			{ paypal_id: trans, username: user, amount: amt },
			`Failed to update IGMOREFOLLOWERS balance`
		);
		console.error('Error adding payment igmorefollowers:', error.message);
		throw new Error('Failed to add payment');
	}
}

const captureOrder = async (orderID, username, amount) => {
	const collect = {
		id: orderID,
		prefer: 'return=minimal'
	};

	try {
		const { result, statusCode } = await ordersController.ordersCapture(collect);
		let balance = null; // Initialize balance variable
		if (statusCode == '201' && result.status == 'COMPLETED') {
			logger.info(
				{ paypal_id: result.id, result: result.status, username: username, amount: amount },
				'Order Successfully Captured'
			);
			balance = await addPayment(amount, username, orderID);
		}
		return {
			jsonResponse: result,
			httpStatusCode: statusCode,
			balance: balance
		};
	} catch (error) {
		throw error;
	}
};

export async function POST({ request, params }) {
	try {
		const { username, amount } = await request.json();
		const { orderID } = params;
		const { jsonResponse, httpStatusCode, balance } = await captureOrder(orderID, username, amount);

		return json(
			{
				jsonResponse,
				balance
			},
			{ status: httpStatusCode }
		);
	} catch (error) {
		console.error('Failed to capture order:', error);
		return json({
			status: 500,
			body: { error: 'Failed to capture order.' }
		});
	}
}
