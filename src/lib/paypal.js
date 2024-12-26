// src/lib/paypal.js
import dotenv from 'dotenv';
import {
	ApiError,
	Client,
	Environment,
	LogLevel,
	OrdersController,
	PaymentsController
} from '@paypal/paypal-server-sdk';

dotenv.config();

const client = new Client({
	clientCredentialsAuthCredentials: {
		oAuthClientId: process.env.PAYPAL_LIVE_CLIENT_ID,
		oAuthClientSecret: process.env.PAYPAL_LIVE_CLIENT_SECRET
	},
	timeout: 0,
	environment: Environment.LIVE,
	logging: {
		logLevel: LogLevel.Info,
		logRequest: { logBody: true },
		logResponse: { logHeaders: true }
	}
});

export const ordersController = new OrdersController(client);
export const paymentsController = new PaymentsController(client);
