import { json, error } from '@sveltejs/kit'; // Note the missing `error` import here
import { getLogs } from '$lib/mongo';

export async function GET() {
	try {
		const logs = await getLogs();
		return json({ logs }); // Send logs as a JSON response
	} catch (err) {
		console.error('Error fetching logs from MongoDB:', err.message);
		throw error(500, 'Unable to fetch logs.');
	}
}
