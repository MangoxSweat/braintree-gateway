import { json, error } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export async function GET() {
	const mongoUrl =
		process.env.ENVIRONMENT === 'Dev' ? process.env.MONGODB_LOCAL_URI : process.env.MONGO_URL;

	let client;
	try {
		await client.connect();
		dbInstance = client.db(process.env.MONGODB_DBS);
		db.collection('logs');
		const logs = await collection.find({}).toArray();
		return json({ logs }); // Send logs as a JSON response
	} catch (err) {
		console.error('Error fetching logs from MongoDB:', err.message);
		throw error(500, 'Unable to fetch logs.');
	}
}
