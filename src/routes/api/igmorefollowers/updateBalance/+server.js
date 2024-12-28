import { json } from '@sveltejs/kit';
import axios from 'axios';
import pino from 'pino';
import dotenv from 'dotenv';
import fs from 'fs/promises';
dotenv.config();

// This runs when the module is first imported
console.log('Initializing logger and ensuring logs directory.');

await ensureLogsDirectory();
const logger = await getLogger();

async function getLogger() {
	// Dynamically import pino
	const logFile = await fs.open('./logs/app.log', 'a'); // Open log file for appending
	const logger = pino(
		{
			level: 'info',
			transport: {
				target: 'pino-pretty',
				options: {
					destination: './logs/app.log',
					colorize: true
				}
			}
		},
		logFile
	); // Initialize logger with file destination

	// Ensure the log file is closed when the process exits
	process.on('exit', async () => {
		await logFile.close();
	});

	return logger;
}

async function ensureLogsDirectory() {
	await fs.mkdir('./logs', { recursive: true });
}

async function addPayment(amt, user, trans) {
	console.log('add payment igmorefollowers');
	const url = 'https://igmorefollowers.com/adminapi/v2/payments/add';
	const body = {
		username: user,
		amount: amt,
		method: 'Perfect Money USD',
		memo: 'added via Admin API',
		affiliate_commission: false
	};
	const headers = {
		'Content-Type': 'application/json',
		'X-Api-Key': process.env.IGMORE_API_KEY
	};

	try {
		console.log('update amount: ', amt);
		const response = await axios.post(url, body, { headers });

		if (response.error_code) {
			throw new Error(response.error_message);
		}

		console.log('Updated balance to: ', response.data.data.user.balance);
		logger.info(`Successful transaction - ID: ${trans} - Username: ${user} - Amount: ${amt}`);
		return response.data.data.user.balance;
	} catch (error) {
		logger.error(
			`Failed transaction - ID: ${trans} - Username: ${user} - Amount: ${amt} - Error: ${error.message}`
		);
		console.error('Error adding payment igmorefollowers:', error.message);
		throw new Error('Failed to add payment');
	}
}

export async function POST({ request }) {
	try {
		const { username, amount, transaction } = await request.json();

		const balance = await addPayment(amount, username, transaction);

		return json({
			status: 200,
			body: { success: `Your balance successfully updated to ${balance}` }
		});
	} catch (error) {
		console.error('Failed to capture order:', error);
		return json({
			status: 500,
			body: { error: `Failed to capture order - ${error}` }
		});
	}
}
