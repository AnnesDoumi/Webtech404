import express from 'express';
import client from '../db.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// Favoriten abrufen
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await client.execute("SELECT movie_id, note, folder_id FROM favorites WHERE user_id = ?", [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Fehler beim Abrufen der Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Favoriten" });
    }
});

// Favoriten hinzufügen (doppelte Einträge verhindern)
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { movie_id, note, folder_id } = req.body;

    try {
        const existingEntry = await client.execute(
            "SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?",
            [userId, movie_id]
        );

        if (existingEntry.rowLength > 0) {
            return res.status(409).json({ message: "Film ist bereits in den Favoriten vorhanden." });
        }

        await client.execute(
            "INSERT INTO favorites (user_id, movie_id, note, folder_id) VALUES (?, ?, ?, ?)",
            [userId, movie_id, note || '', folder_id || null]
        );
        res.status(201).json({ message: "Film erfolgreich zu Favoriten hinzugefügt" });
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Hinzufügen des Favoriten" });
    }
});

// Notiz für einen Favoriten aktualisieren
// Notiz für einen Favoriten aktualisieren
router.put('/:movieId/note', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const movieId = req.params.movieId;
    let { note } = req.body;

    // Wenn die Notiz ein leerer String ist, speichere `null`
    if (note.trim() === "") {
        note = null;
    }

    try {
        await client.execute(
            "UPDATE favorites SET note = ? WHERE user_id = ? AND movie_id = ?",
            [note, userId, movieId]
        );
        res.status(200).json({ message: "Notiz erfolgreich aktualisiert" });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Notiz:", error);
        res.status(500).json({ message: "Fehler beim Aktualisieren der Notiz" });
    }
});


// Film in Ordner verschieben
router.put('/:movieId/folder', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const movieId = req.params.movieId;
    const { folderId } = req.body;

    try {
        await client.execute(
            "UPDATE favorites SET folder_id = ? WHERE user_id = ? AND movie_id = ?",
            [folderId || null, userId, movieId]
        );
        res.status(200).json({ message: "Film erfolgreich verschoben" });
    } catch (error) {
        console.error("Fehler beim Verschieben des Films:", error);
        res.status(500).json({ message: "Fehler beim Verschieben des Films" });
    }
});

// Favorit entfernen
router.delete('/:movieId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const movieId = req.params.movieId;

    try {
        await client.execute(
            "DELETE FROM favorites WHERE user_id = ? AND movie_id = ?",
            [userId, movieId]
        );
        res.status(200).json({ message: "Favorit erfolgreich entfernt" });
    } catch (error) {
        console.error("Fehler beim Entfernen des Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Entfernen des Favoriten" });
    }
});

export default router;
