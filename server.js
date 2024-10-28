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
app.use(cors());

// API-Routen
app.use('/api/auth', authRoutes);
app.use('/api/user/favorites', favoritesRoutes);

// Stelle sicher, dass 'dist' korrekt in Vercel verfügbar ist
app.use(express.static(path.resolve('dist')));

// Fang nur `/api` Routen ab und verarbeite alles andere als statische Seiten
app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    testDBConnection();
});

async function testDBConnection() {
    try {
        const result = await client.execute('SELECT 1');
        console.log('Connected to Turso:', result);
    } catch (error) {
        console.error('Database connection error:', error);
    }
}
