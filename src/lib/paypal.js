// src/lib/paypal.js
import dotenv from 'dotenv';
dotenv.config();
console.log('PAYPAL_LIVE_CLIENT_ID:', process.env.PAYPAL_LIVE_CLIENT_ID || 'Not Set');
console.log('PAYPAL_LIVE_CLIENT_ID:', process.env.PAYPAL_LIVE_CLIENT_ID || 'Not Set');
console.log('PAYPAL_SANDBOX_CLIENT_SECRET:', process.env.PAYPAL_SANDBOX_CLIENT_SECRET || 'Not Set');
console.log('PAYPAL_SANDBOX_CLIENT_SECRET:', process.env.PAYPAL_SANDBOX_CLIENT_SECRET || 'Not Set');

import {
	ApiError,
	Client,
	Environment,
	LogLevel,
	OrdersController,
	PaymentsController
} from '@paypal/paypal-server-sdk';

const clientId = process.env.PAYPAL_LIVE_CLIENT_ID;
const clientSecret = process.env.PAYPAL_LIVE_CLIENT_SECRET;
const sandboxId = process.env.PAYPAL_SANDBOX_CLIENT_ID;
const sandboxSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

if (!clientId || !clientSecret) {
	throw new Error('PayPal client ID and secret must be set in environment variables');
}

const client = new Client({
	clientCredentialsAuthCredentials: {
		oAuthClientId: clientId,
		oAuthClientSecret: clientSecret
	},
	/*
	clientCredentialsAuthCredentials: {
		oAuthClientId: sandboxId,
		oAuthClientSecret: sandboxSecret
	},
    */
	timeout: 0,
	environment: Environment.Production,
	logging: {
		logLevel: LogLevel.Info,
		logRequest: { logBody: true },
		logResponse: { logHeaders: true }
	}
});

export const ordersController = new OrdersController(client);
export const paymentsController = new PaymentsController(client);
