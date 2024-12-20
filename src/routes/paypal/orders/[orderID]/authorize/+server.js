import { json } from '@sveltejs/kit';
import { ordersController } from '$lib/paypal.js';
import { ApiError } from '@paypal/paypal-server-sdk';

/**
 * Authorize payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_authorize
 */
const authorizeOrder = async (orderID) => {
	const collect = {
		id: orderID,
		prefer: 'return=minimal'
	};

	try {
		const { body, ...httpResponse } = await ordersController.ordersAuthorize(collect);
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

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ params }) {
	try {
		const { orderID } = params;
		const { jsonResponse, httpStatusCode } = await authorizeOrder(orderID);
		return json(jsonResponse, { status: httpStatusCode });
	} catch (error) {
		console.error('Failed to authorize order:', error);
		return json({ error: 'Failed to authorize order.' }, { status: 500 });
	}
}
