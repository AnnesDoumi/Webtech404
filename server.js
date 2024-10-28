import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './api/auth.js';
import favoritesRoutes from './api/favorites.js';

dotenv.config();

const app = express();
app.use(express.json());

// CORS konfigurieren
app.use(cors({
    origin: ['https://webtech404.vercel.app', 'http://localhost:5173']
}));

// Routen für die API verwenden
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Statische Dateien für das Vue-Frontend
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-All Route für das Vue-Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});

export default app;
