// auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Debugging: Überprüfen der Umgebungsvariable JWT_SECRET
console.log('JWT_SECRET:', JWT_SECRET);

// Registrieren
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log("Registrierungsdaten erhalten:", { username, email });

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Bitte geben Sie alle Informationen an." });
    }

    try {
        const userExists = await db.execute("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
        console.log("Benutzerprüfung Ergebnis:", userExists);

        if (userExists?.rows?.length > 0) {
            return res.status(400).json({ message: "Nutzername oder E-Mail bereits registriert." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();
        const id = uuidv4();

        await db.execute("INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)",
            [id, username, email, hashedPassword, createdAt]);

        res.status(201).json({ message: "Registrierung erfolgreich" });
    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        res.status(500).json({ message: "Serverfehler" });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log("Login-Anfrage erhalten:", req.body); // Überprüfe die empfangenen Daten
    const { username, password } = req.body;
    console.log("Login-Anfrage für Benutzer:", username);

    if (!username || !password) {
        return res.status(400).json({ message: "Bitte Benutzername und Passwort eingeben." });
    }

    try {
        const user = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
        console.log("Benutzer gefunden:", user.rows);

        if (!user?.rows?.length) {
            return res.status(400).json({ message: "Ungültiger Benutzername oder Passwort." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Ungültiger Benutzername oder Passwort." });
        }

        const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username });
    } catch (error) {
        console.error("Fehler beim Login:", error);
        res.status(500).json({ message: "Serverfehler" });
    }
});

export default router;
