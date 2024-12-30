import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl =
	process.env.ENVIRONMENT === 'Dev' ? process.env.MONGODB_LOCAL_URI : process.env.MONGO_URL;

const client = new MongoClient(mongoUrl);
const dbName = process.env.MONGODB_DBS;

let dbInstance = null; // Singleton to store the database connection

// Function to get the database instance
export async function getDbInstance() {
	if (!dbInstance) {
		await client.connect();
		dbInstance = client.db(dbName);
	}
	return dbInstance;
}

// Function to get the logs collection
export async function logCollection() {
	const db = await getDbInstance();
	return db.collection('logs');
}

// Function to fetch all logs (for demonstration purposes)
export async function getLogs() {
	const collection = await logCollection();
	return await collection.find({}).toArray();
}

// Ensure the client closes when the application terminates
process.on('SIGINT', async () => {
	console.log('Closing MongoDB connection...');
	await client.close();
	process.exit(0);
});
