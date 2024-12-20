// src/routes/api/orders/[orderID]/capture.js
import { ApiError } from '@paypal/paypal-server-sdk';
import { ordersController } from '$lib/paypal.js';

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
	const collect = {
		id: orderID,
		prefer: 'return=minimal'
	};

	try {
		const { body, ...httpResponse } = await ordersController.ordersCapture(collect);
		// Get more response info...
		// const { statusCode, headers } = httpResponse;
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

export async function post({ params }) {
	try {
		const { orderID } = params;
		const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
		return {
			status: httpStatusCode,
			body: jsonResponse
		};
	} catch (error) {
		console.error('Failed to capture order:', error);
		return {
			status: 500,
			body: { error: 'Failed to capture order.' }
		};
	}
}
