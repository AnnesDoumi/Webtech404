// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './api/auth.js';
import favoritesRoutes from './api/favorites.js';
import client from './db.js';

// Load environment variables from .env file
dotenv.config();

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Unified CORS options for both development and production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.VITE_API_BASE_URL   // Production URL
        : 'http://localhost:5173',        // Development URL
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Serve static files from the 'dist' directory (for Vue frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback route to serve index.html for any route not starting with /api
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Set server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    testDBConnection();
});

// Function to test database connection
async function testDBConnection() {
    try {
        const result = await client.execute('SELECT 1');
        console.log('Connected to Turso:', result);
    } catch (error) {
        console.error('Database connection error:', error);
    }
}
