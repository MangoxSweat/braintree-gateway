import { json } from '@sveltejs/kit';
import { ApiError } from '@paypal/paypal-server-sdk';
import { ordersController } from '$lib/paypal.js';

export const POST = async ({ request }) => {
	try {
		// Use the cart information passed from the front-end to calculate the order amount details
		const { cart } = await request.json();
		const { jsonResponse, httpStatusCode } = await createOrder(cart);
		return json(jsonResponse, { status: httpStatusCode });
	} catch (error) {
		console.error('Failed to create order:', error);
		return json({ error: 'Failed to create order.' }, { status: 500 });
	}
};

/**
 * Create an order to start the transaction with 3D Secure enabled.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (cart) => {
	const payload = {
		body: {
			intent: 'CAPTURE',
			purchase_units: [
				{
					amount: {
						currency_code: 'USD',
						// Replace with dynamic cart total calculation
						value: '100'
					}
				}
			],
			payment_source: {
				card: {
					// Enable 3D Secure
					three_d_secure: {
						enabled: true
					}
				}
			}
		},
		prefer: 'return=minimal'
	};

	try {
		const { body, ...httpResponse } = await ordersController.ordersCreate(payload);
		return {
			jsonResponse: JSON.parse(body),
			httpStatusCode: httpResponse.statusCode
		};
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message);
		}
		throw error; // Handle non-API errors
	}
};
