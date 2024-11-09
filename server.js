import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './api/auth.js';
import favoritesRoutes from './api/favorites.js';
import foldersRoutes from './api/folders.js';
import seriesFavoritesRouter from './api/seriesFavorites.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: ['https://webtech404.vercel.app', 'http://localhost:5173']
}));

// API-Routen verwenden
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/series-favorites', seriesFavoritesRouter);

// Statische Dateien bereitstellen
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// Setze den MIME-Type für JavaScript-Dateien
app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
    }
    next();
});

// Fallback für das Frontend: Bediene nur HTML-Anfragen mit `index.html`
app.get('*', (req, res) => {
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        res.status(404).send('Not Found');
    }
});

// Export für Vercel
export default app;

// Server für lokale Entwicklung
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server läuft lokal auf Port ${PORT}`);
    });
}
