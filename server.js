import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './api/auth.js';
import favoritesRoutes from './api/favorites.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: ['https://webtech404.vercel.app', 'http://localhost:5173']
}));

// API-Routen verwenden
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Statische Dateien bereitstellen
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback für das Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export für Vercel (Serverless Environment)
export default app;

// Nur für lokale Entwicklung: Server direkt starten, wenn `NODE_ENV` nicht auf `production` gesetzt ist
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server läuft lokal auf Port ${PORT}`);
    });
}
