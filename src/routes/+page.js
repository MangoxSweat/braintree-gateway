import { json } from '@sveltejs/kit';

export async function load({ fetch }) {
	try {
		// Fetch logs from the API route
		const res = await fetch('/api/env');

		if (!res.ok) {
			throw new Error('Failed to fetch Environment');
		}
		const data = await res.json(); // Parse the JSON response

		return { env: data }; // Pass the logs to the page as props
	} catch (err) {
		console.error('Error loading environment :', err.message);
		return {
			logs: 'Failed to load environment.' // Fallback in case of an error
		};
	}
}
