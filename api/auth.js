// auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Registrierung
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Bitte geben Sie alle Informationen an." });
    }

    try {
        // Prüfe, ob der Nutzer bereits existiert
        const userExists = await db.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
        if (userExists.rows.length) {
            return res.status(400).json({ message: "Nutzername oder E-Mail bereits registriert." });
        }

        // Passwort hashen und Nutzer erstellen
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, hashedPassword]);
        res.status(201).json({ message: "Registrierung erfolgreich" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Serverfehler" });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        if (!user.rows.length) {
            return res.status(400).json({ message: "Ungültiger Benutzername oder Passwort." });
        }

        // Passwort überprüfen
        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Ungültiger Benutzername oder Passwort." });
        }

        // JWT-Token erstellen
        const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Serverfehler" });
    }
});

// Geschützte Route als Beispiel
router.get('/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Kein Token bereitgestellt" });

    const token = authHeader.split(' ')[1]; // Extrahiert das Token aus "Bearer <token>"

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token ist ungültig" });
        res.json({ message: "Profil erfolgreich geladen", user });
    });
});

export default router;
