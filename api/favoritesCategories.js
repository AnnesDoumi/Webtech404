import express from 'express';
import client from '../db.js';
import { authenticateToken } from './authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Kategorie erstellen
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Kategoriename erforderlich." });
    }

    try {
        const categoryId = uuidv4();
        await client.execute(
            "INSERT INTO categories (id, name, user_id) VALUES (?, ?, ?)",
            [categoryId, name, userId]
        );
        res.status(201).json({ id: categoryId, name });
    } catch (error) {
        console.error("Fehler beim Erstellen der Kategorie:", error);
        res.status(500).json({ message: "Serverfehler beim Erstellen der Kategorie" });
    }
});

// Alle Kategorien abrufen mit Anzahl der zugehörigen Filme/Serien
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const categories = await client.execute("SELECT * FROM categories WHERE user_id = ?", [userId]);
        const categoryCounts = await client.execute(
            "SELECT category_id, COUNT(*) as count FROM category_entries WHERE user_id = ? GROUP BY category_id",
            [userId]
        );

        const categoriesWithCounts = categories.rows.map(category => {
            const countEntry = categoryCounts.rows.find(entry => entry.category_id === category.id);
            return { ...category, count: countEntry ? countEntry.count : 0 };
        });

        res.json(categoriesWithCounts);
    } catch (error) {
        console.error("Fehler beim Abrufen der Kategorien:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Kategorien" });
    }
});

// Kategorie bearbeiten
router.put('/:categoryId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const categoryId = req.params.categoryId;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Neuer Kategoriename erforderlich." });
    }

    try {
        await client.execute(
            "UPDATE categories SET name = ? WHERE id = ? AND user_id = ?",
            [name, categoryId, userId]
        );
        res.status(200).json({ message: "Kategorie erfolgreich aktualisiert" });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Kategorie:", error);
        res.status(500).json({ message: "Fehler beim Aktualisieren der Kategorie" });
    }
});

// Kategorie löschen (und alle zugeordneten Einträge in "Ohne Kategorie" verschieben)
router.delete('/:categoryId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const categoryId = req.params.categoryId;

    try {
        await client.execute(
            "UPDATE category_entries SET category_id = NULL WHERE category_id = ? AND user_id = ?",
            [categoryId, userId]
        );
        await client.execute(
            "DELETE FROM categories WHERE id = ? AND user_id = ?",
            [categoryId, userId]
        );
        res.status(200).json({ message: "Kategorie erfolgreich gelöscht" });
    } catch (error) {
        console.error("Fehler beim Löschen der Kategorie:", error);
        res.status(500).json({ message: "Fehler beim Löschen der Kategorie" });
    }
});

// Filme oder Serien einer Kategorie zuordnen
router.post('/:categoryId/assign', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const categoryId = req.params.categoryId;
    const { entryId, type } = req.body; // type = 'movie' oder 'series'

    if (!entryId || !type) {
        return res.status(400).json({ message: "Eintrag ID und Typ sind erforderlich." });
    }

    try {
        await client.execute(
            "INSERT INTO category_entries (user_id, category_id, entry_id, type) VALUES (?, ?, ?, ?)",
            [userId, categoryId, entryId, type]
        );
        res.status(200).json({ message: "Eintrag erfolgreich zur Kategorie hinzugefügt" });
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Eintrags zur Kategorie:", error);
        res.status(500).json({ message: "Fehler beim Hinzufügen des Eintrags zur Kategorie" });
    }
});

router.get('/:categoryId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const categoryId = req.params.categoryId;

    try {
        // Hole die Kategorie-Informationen
        const categoryResult = await client.execute(
            "SELECT * FROM categories WHERE id = ? AND user_id = ?",
            [categoryId, userId]
        );

        if (categoryResult.rowLength === 0) {
            return res.status(404).json({ message: "Kategorie nicht gefunden" });
        }

        // Hole alle Filme/Serien in dieser Kategorie
        const entriesResult = await client.execute(
            "SELECT entry_id, type FROM category_entries WHERE category_id = ? AND user_id = ?",
            [categoryId, userId]
        );

        if (entriesResult.rowLength === 0) {
            return res.json({ category: categoryResult.rows[0], movies: [] });
        }

        // Hole die Filmdetails aus der API
        const apiKey = process.env.VITE_TMDB_API_KEY;
        const movies = await Promise.all(
            entriesResult.rows.map(async (entry) => {
                const type = entry.type === "movie" ? "movie" : "tv";
                const response = await fetch(
                    `https://api.themoviedb.org/3/${type}/${entry.entry_id}?api_key=${apiKey}`
                );
                const data = await response.json();
                return {
                    id: entry.entry_id,
                    title: data.title || data.name,
                    poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
                };
            })
        );

        res.json({ category: categoryResult.rows[0], movies });

    } catch (error) {
        console.error("Fehler beim Abrufen der Kategorie-Details:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Kategorie-Details" });
    }
});


router.put('/remove/:entryId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const entryId = req.params.entryId;

    try {
        // Überprüfe, ob der Eintrag existiert
        const entryExists = await client.execute(
            "SELECT * FROM category_entries WHERE entry_id = ? AND user_id = ?",
            [entryId, userId]
        );

        if (entryExists.rowLength === 0) {
            return res.status(404).json({ message: "Eintrag nicht gefunden" });
        }

        // Entferne die Kategorie-Zuordnung (setze category_id auf NULL)
        await client.execute(
            "DELETE FROM category_entries WHERE entry_id = ? AND user_id = ?",
            [entryId, userId]
        );


        res.status(200).json({ message: "Eintrag erfolgreich zurück in Favoriten verschoben" });
    } catch (error) {
        console.error("Fehler beim Entfernen aus der Kategorie:", error);
        res.status(500).json({ message: "Fehler beim Entfernen aus der Kategorie" });
    }
});

export default router;
