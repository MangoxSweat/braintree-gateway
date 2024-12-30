// src/lib/paypal.js
import dotenv from 'dotenv';
dotenv.config();

import {
	ApiError,
	Client,
	Environment,
	LogLevel,
	OrdersController,
	PaymentsController
} from '@paypal/paypal-server-sdk';

const liveId = process.env.PAYPAL_LIVE_CLIENT_ID;
const liveSecret = process.env.PAYPAL_LIVE_CLIENT_SECRET;
const sandboxId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
const sandboxSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
let clientId, clientSecret;
console.log(process.env.ENVIRONMENT);

if (process.env.ENVIRONMENT === 'Live') {
	clientId = liveId;
	clientSecret = liveSecret;
} else {
	clientId = sandboxId;
	clientSecret = sandboxSecret;
}
console.log('clientid', clientId);

if (!clientId || !clientSecret) {
	throw new Error('PayPal client ID and secret must be set in environment variables');
}
const client = new Client({
	clientCredentialsAuthCredentials: {
		oAuthClientId: clientId,
		oAuthClientSecret: clientSecret
	},
	timeout: 0,
	environment: process.env.ENVIRONMENT === 'Live' ? Environment.Production : Environment.Sandbox,
	logging: {
		logLevel: LogLevel.Info,
		logRequest: { logBody: true },
		logResponse: { logHeaders: true }
	}
});

export const ordersController = new OrdersController(client);
export const paymentsController = new PaymentsController(client);
