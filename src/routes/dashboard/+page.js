import fs from 'fs';
import path from 'path';
import pino from 'pino';

const logger = pino({
	transport: {
		target: 'pino-pretty',
		options: {
			destination: path.join(process.cwd(), 'logs', 'app.log') // specify the log file path
		}
	}
});

export async function load({ request }) {
	const logFilePath = path.join(process.cwd(), 'logs', 'app.log');
	let logs = '';

	try {
		logs = fs.readFileSync(logFilePath, 'utf-8');
	} catch (err) {
		logger.error('Error reading log file:', err);
	}

	return {
		logs
	};
}

logger.info('Pino logger initialized');
