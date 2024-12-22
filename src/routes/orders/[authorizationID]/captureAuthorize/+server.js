// src/routes/orders/[authorizationId]/captureAuthorize.js
import { json } from '@sveltejs/kit';
import { ApiError } from '@paypal/paypal-server-sdk';
import { paymentsController } from '$lib/paypal.js';

/**
 * Captures an authorized payment, by ID.
 * @see https://developer.paypal.com/docs/api/payments/v2/#authorizations_capture
 */
const captureAuthorize = async (authorizationId) => {
	const collect = {
		authorizationId: authorizationId,
		prefer: 'return=minimal',
		body: {
			finalCapture: false
		}
	};
	try {
		const { body, ...httpResponse } = await paymentsController.authorizationsCapture(collect);
		return {
			jsonResponse: JSON.parse(body),
			httpStatusCode: httpResponse.statusCode
		};
	} catch (error) {
		if (error instanceof ApiError) {
			throw new Error(error.message);
		}
	}
};

export async function POST({ params }) {
	try {
		const { authorizationId } = params;
		const { jsonResponse, httpStatusCode } = await captureAuthorize(authorizationId);
		return json(jsonResponse, { status: httpStatusCode });
	} catch (error) {
		console.error('Failed to capture authorize:', error);
		return json({ error: 'Failed to capture authorize.' }, { status: 500 });
	}
}
