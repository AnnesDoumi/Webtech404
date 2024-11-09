import express from 'express';
import client from '../db.js';
import { authenticateToken } from './authMiddleware.js';

const router = express.Router();

// Serien-Favoriten abrufen
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await client.execute("SELECT series_id, note, folder_id FROM series_favorites WHERE user_id = ?", [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Fehler beim Abrufen der Serien-Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Serien-Favoriten" });
    }
});

// Serien-Favoriten hinzufügen
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { series_id, note, folder_id } = req.body;

    try {
        const existingEntry = await client.execute(
            "SELECT * FROM series_favorites WHERE user_id = ? AND series_id = ?",
            [userId, series_id]
        );

        if (existingEntry.rowLength > 0) {
            return res.status(409).json({ message: "Serie ist bereits in den Favoriten vorhanden." });
        }

        await client.execute(
            "INSERT INTO series_favorites (user_id, series_id, note, folder_id) VALUES (?, ?, ?, ?)",
            [userId, series_id, note || '', folder_id || null]
        );
        res.status(201).json({ message: "Serie erfolgreich zu Favoriten hinzugefügt" });
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Serien-Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Hinzufügen der Serien-Favoriten" });
    }
});

// Notiz für einen Serien-Favoriten aktualisieren
router.put('/:seriesId/note', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const seriesId = req.params.seriesId;
    let { note } = req.body;

    // Wenn die Notiz ein leerer String ist, speichere `null`
    if (note.trim() === "") {
        note = null;
    }

    try {
        await client.execute(
            "UPDATE series_favorites SET note = ? WHERE user_id = ? AND series_id = ?",
            [note, userId, seriesId]
        );
        res.status(200).json({ message: "Notiz erfolgreich aktualisiert" });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Notiz:", error);
        res.status(500).json({ message: "Fehler beim Aktualisieren der Notiz" });
    }
});



// Serie in Ordner verschieben
router.put('/:seriesId/folder', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const seriesId = req.params.seriesId;
    const { folderId } = req.body;

    try {
        await client.execute(
            "UPDATE series_favorites SET folder_id = ? WHERE user_id = ? AND series_id = ?",
            [folderId || null, userId, seriesId]
        );
        res.status(200).json({ message: "Serie erfolgreich verschoben" });
    } catch (error) {
        console.error("Fehler beim Verschieben der Serie:", error);
        res.status(500).json({ message: "Fehler beim Verschieben der Serie" });
    }
});

// Serien-Favoriten entfernen
router.delete('/:seriesId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const seriesId = req.params.seriesId;

    try {
        await client.execute(
            "DELETE FROM series_favorites WHERE user_id = ? AND series_id = ?",
            [userId, seriesId]
        );
        res.status(200).json({ message: "Serien-Favorit erfolgreich entfernt" });
    } catch (error) {
        console.error("Fehler beim Entfernen der Serien-Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Entfernen der Serien-Favoriten" });
    }
});

export default router;
