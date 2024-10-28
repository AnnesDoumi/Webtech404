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

// Aktualisierte CORS-Optionen
const allowedOrigins = [
    process.env.VITE_API_BASE_URL,  // URL für Vercel oder Production
    'http://localhost:5173'         // Lokale Entwicklungsumgebung
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Nicht erlaubter CORS-Origin'));
        }
    },
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// API-Routen
app.use('/api/auth', authRoutes);
app.use('/api/user/favorites', favoritesRoutes);

// Statische Dateien für das Vue-Frontend aus dem 'dist'-Ordner servieren
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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
