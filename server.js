// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './api/auth.js';
import favoritesRoutes from './api/favorites.js';
import client from './db.js';

dotenv.config();

const app = express();
app.use(express.json());

// CORS-Optionen für lokale und Vercel-Umgebungen
const corsOptions = {
    origin: [
        'http://localhost:5173', // Lokale Frontend-Entwicklung
        process.env.VERCEL_URL,  // Vercel-Umgebungs-URL
    ],
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
};
app.use(cors(corsOptions));

// API-Routen
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Statische Dateien für das Vue-Frontend aus dem 'dist'-Ordner servieren
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Server-Port festlegen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    testDBConnection();
});

// Test der Datenbankverbindung
async function testDBConnection() {
    try {
        const result = await client.execute('SELECT 1');
        console.log('Connected to Turso:', result);
    } catch (error) {
        console.error('Database connection error:', error);
    }
}
