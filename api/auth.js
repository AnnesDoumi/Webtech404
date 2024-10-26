// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Bitte geben Sie alle Informationen an." });
    }

    // Prüfe, ob der Nutzer bereits existiert
    const userExists = await db.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
    if (userExists.rows.length) return res.status(400).json({ message: "Nutzername oder E-Mail bereits registriert." });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, hashedPassword]);
    res.status(201).json({ message: "Registrierung erfolgreich" });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (!user.rows.length) return res.status(400).json({ message: "Ungültiger Benutzername oder Passwort." });

    const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isPasswordValid) return res.status(400).json({ message: "Ungültiger Benutzername oder Passwort." });

    const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username });
});

module.exports = router;
