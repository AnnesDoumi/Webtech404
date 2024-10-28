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

<<<<<<< HEAD
=======
// Configure __dirname for ES modules
>>>>>>> test1
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

<<<<<<< HEAD
// CORS-Optionen für lokale und Vercel-Umgebungen
const corsOptions = {
    origin: [
        'http://localhost:5173',          // Lokale Entwicklung
        'https://webtech404.vercel.app'   // Vercel-Deployment
    ],
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
};
app.use(cors(corsOptions));



// API-Routen
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Statische Dateien für das Vue-Frontend aus dem 'dist'-Ordner
app.use(express.static(path.join(__dirname, 'dist')));

=======
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
>>>>>>> test1
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

<<<<<<< HEAD
// Server-Port festlegen
=======
// Set server port
>>>>>>> test1
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
    testDBConnection();
});

<<<<<<< HEAD
// Test der Datenbankverbindung
=======
// Function to test database connection
>>>>>>> test1
async function testDBConnection() {
    try {
        const result = await client.execute('SELECT 1');
        console.log('Connected to Turso:', result);
    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Database connection failed');
    }
}
