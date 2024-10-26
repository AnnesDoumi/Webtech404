// routes/favorites.js
const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { movieId, userId } = req.body;
    try {
        await db.query('INSERT INTO favorites (user_id, movie_id) VALUES ($1, $2)', [userId, movieId]);
        res.status(201).json({ message: 'Film erfolgreich zu Favoriten hinzugefügt' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fehler beim Hinzufügen des Films zu Favoriten' });
    }
});

router.get('/', async (req, res) => {
    const { userId } = req.query;
    try {
        const result = await db.query('SELECT * FROM favorites WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Favoriten' });
    }
});

module.exports = router;
