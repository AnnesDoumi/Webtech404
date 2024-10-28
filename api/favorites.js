import express from 'express';
import client from '../db.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// Favoriten abfragen
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await client.execute("SELECT movie_id FROM favorites WHERE user_id = ?", [userId]);

        if (!result.rows || result.rows.length === 0) {
            return res.json([]);
        }

        const favoriteMovies = await Promise.all(result.rows.map(async (row) => {
            const movieId = row.movie_id;
            return { id: movieId, title: `Movie ${movieId}`, poster_path: '/path/to/poster.jpg' };
        }));

        res.json(favoriteMovies);
    } catch (error) {
        console.error("Fehler beim Abrufen der Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Favoriten" });
    }
});

// Favorit entfernen
router.delete('/:movieId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const movieId = req.params.movieId;

    try {
        await client.execute("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?", [userId, movieId]);
        res.status(200).json({ message: "Favorit erfolgreich entfernt" });
    } catch (error) {
        console.error("Fehler beim Entfernen des Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Entfernen des Favoriten" });
    }
});

export default router;
