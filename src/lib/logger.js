import pino from 'pino';
import dotenv from 'dotenv';
dotenv.config();

export async function getLogger() {
	// MongoDB URI
	const mongoUrl =
		process.env.ENVIRONMENT === 'Dev' ? process.env.MONGODB_LOCAL_URI : process.env.MONGO_URL;

	// Transport configuration for pino-mongodb
	const transport = pino.transport({
		target: 'pino-mongodb', // Specify the pino-mongodb transport
		level: ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 10, 20, 30, 40, 50, 60], // Log levels
		options: {
			uri: mongoUrl, // MongoDB URI
			database: process.env.MONGODB_DBS,
			collection: 'logs' // Collection name
		}
	});

	// Configure the logger
	/*
	const logger = pino(
		{
			transport: {
				target: 'pino-pretty', // Pretty-print for development
				options: {
					translateTime: 'SYS:standard' // Format timestamp
				}
			}
		},
		transport
	);
    */
	const logger = pino(transport);

	return logger;
}
