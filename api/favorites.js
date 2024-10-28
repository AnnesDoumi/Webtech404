import express from 'express';
import db from '../db.js';
import fetch from 'node-fetch'; // Falls notwendig
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const apiKey = process.env.VITE_TMDB_API_KEY;

    try {
        // Favoriten aus der Datenbank abrufen
        const result = await db.execute("SELECT movie_id FROM favorites WHERE user_id = ?", [userId]);

        if (!result.rows || result.rows.length === 0) {
            console.log("Keine Favoriten gefunden");
            return res.json([]);  // Leere Liste zurückgeben
        }

        // Filmdetails für jeden Favoriten abrufen
        const favoriteMovies = await Promise.all(result.rows.map(async (row) => {
            const movieId = row.movie_id;
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
            const movieData = await response.json();
            console.log("Abgerufene Filmdaten:", movieData); // Debugging-Zeile
            return {
                id: movieData.id,
                title: movieData.title,
                poster_path: movieData.poster_path,
            };
        }));

        console.log("Zurückgegebene Favoriten:", favoriteMovies);
        res.json(favoriteMovies);
    } catch (error) {
        console.error("Fehler beim Abrufen der Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Favoriten" });
    }
});


// In favorites.js
router.delete('/:movieId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const movieId = req.params.movieId;

    try {
        await db.execute("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?", [userId, movieId]);
        res.status(200).json({ message: "Favorit erfolgreich entfernt" });
    } catch (error) {
        console.error("Fehler beim Entfernen des Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Entfernen des Favoriten" });
    }
});


// favorites.js
router.patch('/:movieId/note', async (req, res) => {
    const userId = req.user.userId;
    const { movieId } = req.params;
    const { note } = req.body;

    try {
        const result = await db.execute(
            'UPDATE favorites SET note = ? WHERE user_id = ? AND movie_id = ?',
            [note, userId, movieId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Favorit nicht gefunden." });
        }

        res.json({ message: "Notiz erfolgreich gespeichert" });
    } catch (error) {
        console.error("Fehler beim Speichern der Notiz:", error);
        res.status(500).json({ message: "Serverfehler beim Speichern der Notiz" });
    }
});


export default router;
