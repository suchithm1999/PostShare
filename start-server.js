// Load environment variables before anything else
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Now import and start the server
import('./server.js');
