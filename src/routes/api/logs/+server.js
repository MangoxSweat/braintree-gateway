import { json, error } from '@sveltejs/kit'; // Note the missing `error` import here
import fs from 'fs/promises';

export async function GET() {
	try {
		// Read the log file
		const logContent = await fs.readFile('./logs/app.log', 'utf-8'); // Ensure the path is correct relative to the server's working directory
		console.log('Log file content:', logContent);

		return json({ logs: logContent }); // Send logs as a JSON response
	} catch (err) {
		console.error('Error reading log file:', err.message);
		throw error(500, 'Unable to fetch logs.'); // Proper error response for the API
	}
}
