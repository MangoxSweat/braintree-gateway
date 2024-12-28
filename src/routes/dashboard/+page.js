import { json } from '@sveltejs/kit';

export async function load({ fetch }) {
	try {
		// Fetch logs from the API route
		const res = await fetch('/api/logs');

		if (!res.ok) {
			throw new Error('Failed to fetch logs');
		}
		const data = await res.json(); // Parse the JSON response
		console.log('load', data);

		return { logs: data.logs }; // Pass the logs to the page as props
	} catch (err) {
		console.error('Error loading logs:', err.message);
		return {
			logs: 'Failed to load logs.' // Fallback in case of an error
		};
	}
}
