import { json, error } from '@sveltejs/kit'; // Note the missing `error` import here
import dotenv from 'dotenv';
dotenv.config();

export async function GET() {
	try {
		return json(process.env.ENVIRONMENT); // Send logs as a JSON response
	} catch (err) {
		throw error(500, 'Unable to fetch client id.'); // Proper error response for the API
	}
}
