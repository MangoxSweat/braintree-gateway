import { json } from '@sveltejs/kit';
import axios from 'axios';
import { ApiError } from '@paypal/paypal-server-sdk';
import { ordersController } from '$lib/paypal.js';
import { getLogger } from '$lib/logger';

const logger = await getLogger();

export const POST = async ({ request }) => {
	try {
		// Use the cart information passed from the front-end to calculate the order amount details
		const { username, amount } = await request.json();
		console.log('amount', amount);

		const amountPlusFees = parseInt(amount) + 4;
		console.log('real amount', amountPlusFees);

		const { jsonResponse, httpStatusCode } = await createOrder(username, amountPlusFees.toString());
		return json(jsonResponse, { status: httpStatusCode });
	} catch (error) {
		console.log('Failed to create order:', error);
		return json({ message: error.message }, { status: 500 });
	}
};

async function verifyUser(username) {
	console.log('verifying user');
	try {
		if (!username) {
			console.log('No username provided');
			throw new Error('No username provided');
		}

		const url = `https://igmorefollowers.com/adminapi/v2/users?username=${username}`;
		const headers = {
			'X-Api-Key': process.env.IGMORE_API_KEY
		};

		const response = await axios.get(url, { headers });

		if (
			response.data.data.list &&
			response.data.data.list.some((user) => {
				return user.username === username && user.status === 'Active';
			})
		) {
			console.log('username valid');
			return true;
		} else {
			console.error('User not valid!');
			throw new Error('User not valid!');
		}
	} catch (error) {
		console.error('Error verifying user:', error);
		throw new Error(error.message);
	}
}

/**
 * Create an order to start the transaction with 3D Secure enabled.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (username, amount) => {
	console.log('create order');
	const payload = {
		body: {
			intent: 'CAPTURE',
			purchaseUnits: [
				{
					amount: {
						currencyCode: 'USD',
						// Replace with dynamic cart total calculation
						value: amount
					}
				}
			],
			paymentSource: {
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
		if (await verifyUser(username)) {
			console.log('user verified');
			const { result, statusCode } = await ordersController.ordersCreate(payload);

			console.log('order created');

			logger.info(
				{ paypal_id: result.id, username: username, amount: amount },
				'Order Successfully Created'
			);
			console.log('log created');

			return {
				jsonResponse: result,
				httpStatusCode: statusCode
			};
		}
	} catch (error) {
		logger.error(
			{ paypal_id: result.id, username: username, amount: amount },
			'Failed to create Order'
		);
		if (error instanceof ApiError) {
			throw new Error(error.message);
		}
		throw error; // Handle non-API errors
	}
};
