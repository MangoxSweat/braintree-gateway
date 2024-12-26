// src/lib/paypal.js
import dotenv from 'dotenv';
dotenv.config();
console.log('PAYPAL_LIVE_CLIENT_ID:', process.env.PAYPAL_LIVE_CLIENT_ID || 'Not Set');
console.log('PAYPAL_LIVE_CLIENT_SECRET:', process.env.PAYPAL_LIVE_CLIENT_SECRET || 'Not Set');

import {
	ApiError,
	Client,
	Environment,
	LogLevel,
	OrdersController,
	PaymentsController
} from '@paypal/paypal-server-sdk';

const client = new Client({
	oAuthClientId: process.env.PAYPAL_LIVE_CLIENT_ID,
	oAuthClientSecret: process.env.PAYPAL_LIVE_CLIENT_SECRET,
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
