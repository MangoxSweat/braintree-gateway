import { json, error } from '@sveltejs/kit';

import dotenv from 'dotenv';

dotenv.config();

export async function GET() {
	console.log('GET request received');
	const mongoUrl =
		process.env.ENVIRONMENT === 'Dev' ? process.env.MONGODB_LOCAL_URI : process.env.MONGO_URL;
	console.log('MongoDB URL:', mongoUrl);

	let mongoClient;
	try {
		const { MongoClient } = await import('mongodb');
		console.log('MongoClient imported');
		mongoClient = new MongoClient(mongoUrl);
		await mongoClient.connect();
		console.log('Connected to MongoDB');
		const dbInstance = mongoClient.db(process.env.MONGODB_DBS);
		console.log('Database instance:', process.env.MONGODB_DBS);
		const collection = dbInstance.collection('logs');
		console.log('Collection selected: logs');
		const logs = await collection.find({}).toArray();
		console.log('Logs fetched:', logs);
		return json({ logs }); // Send logs as a JSON response
	} catch (err) {
		console.error('Error fetching logs from MongoDB:', err.message);
		throw error(500, 'Unable to fetch logs.');
	}
}
