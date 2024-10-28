import express from 'express';
import client from '../db.js';
import { authenticateToken } from './authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Ordner erstellen
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Ordnername erforderlich." });
    }

    try {
        const folderId = uuidv4();
        await client.execute(
            "INSERT INTO folders (id, name, user_id) VALUES (?, ?, ?)",
            [folderId, name, userId]
        );
        res.status(201).json({ id: folderId, name });
    } catch (error) {
        console.error("Fehler beim Erstellen des Ordners:", error);
        res.status(500).json({ message: "Serverfehler beim Erstellen des Ordners" });
    }
});

// Alle Ordner und zugehörige Filme abrufen
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const folders = await client.execute("SELECT * FROM folders WHERE user_id = ?", [userId]);
        const favorites = await client.execute(
            "SELECT * FROM favorites WHERE user_id = ?",
            [userId]
        );

        res.json({
            folders: folders.rows,
            favorites: favorites.rows.filter(fav => !fav.folder_id),
            moviesInFolders: favorites.rows.filter(fav => fav.folder_id)
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der Ordner und Filme:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Ordner und Filme" });
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
            [folderId || null, userId, movieId] // Wenn folderId null ist, wird der Film auf die Hauptseite verschoben
        );
        res.status(200).json({ message: "Film erfolgreich verschoben" });
    } catch (error) {
        console.error("Fehler beim Verschieben des Films:", error);
        res.status(500).json({ message: "Fehler beim Verschieben des Films" });
    }
});

// Ordner löschen
router.delete('/:folderId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const folderId = req.params.folderId;

    try {
        await client.execute(
            "UPDATE favorites SET folder_id = NULL WHERE user_id = ? AND folder_id = ?",
            [userId, folderId]
        );
        await client.execute("DELETE FROM folders WHERE user_id = ? AND id = ?", [userId, folderId]);

        res.status(200).json({ message: "Ordner erfolgreich gelöscht" });
    } catch (error) {
        console.error("Fehler beim Löschen des Ordners:", error);
        res.status(500).json({ message: "Fehler beim Löschen des Ordners" });
    }
});

export default router;
