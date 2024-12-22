// src/routes/api/orders/[orderID]/capture.js
import { json } from '@sveltejs/kit';
import { ApiError } from '@paypal/paypal-server-sdk';
import { ordersController } from '$lib/paypal.js';

async function addPayment(amt, user, meth) {
	console.log('add payment igmorefollowers');
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

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
	console.log('captureOrder');

	const collect = {
		id: orderID,
		prefer: 'return=minimal'
	};

	try {
		const { body, ...httpResponse } = await ordersController.ordersCapture(collect);
		// Get more response info...
		//
		// const { statusCode, headers } = httpResponse;
		//
		//if success, addPayment igmorefollowers
		addPayment();
		console.log('add payment');

		return {
			jsonResponse: JSON.parse(body),
			httpStatusCode: httpResponse.statusCode
		};
	} catch (error) {
		if (error instanceof ApiError) {
			// const { statusCode, headers } = error;
			throw new Error(error.message);
		}
	}
};

export async function POST({ params }) {
	try {
		const { orderID } = params;
		const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

		return json({
			status: httpStatusCode,
			body: jsonResponse
		});
	} catch (error) {
		console.error('Failed to capture order:', error);
		return json({
			status: 500,
			body: { error: 'Failed to capture order.' }
		});
	}
}
