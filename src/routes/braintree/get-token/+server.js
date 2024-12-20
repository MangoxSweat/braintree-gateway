import { json } from '@sveltejs/kit';
import { BraintreeGateway, Environment } from 'braintree';
import dotenv from 'dotenv';

// Load environment variables from `.env`
dotenv.config();

export async function GET() {
	try {
		const gateway = new BraintreeGateway({
			environment: Environment.Sandbox,
			merchantId: process.env.BRAINTREE_MERCHANT_ID,
			publicKey: process.env.BRAINTREE_PUBLIC_KEY,
			privateKey: process.env.BRAINTREE_PRIVATE_KEY
		});

		// Generate client token
		const clientToken = await new Promise((resolve, reject) => {
			gateway.clientToken.generate({}, (err, response) => {
				if (err) {
					reject(err);
				} else {
					resolve(response.clientToken);
					console.log('generated token');
				}
			});
		});

		// Return the client token
		return json({ clientToken });
	} catch (error) {
		console.error('Error generating Braintree client token:', error);
		return json({ error: 'Failed to generate client token' }, { status: 500 });
	}
}
