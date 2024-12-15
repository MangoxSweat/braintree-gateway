import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('build')); // Serve the build folder of the Svelte project

// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
