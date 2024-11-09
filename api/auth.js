import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import client from '../db.js'; // Verweis auf die Datenbankverbindung
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Registrierung
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Bitte geben Sie alle Informationen an." });
    }

    try {
        const userExists = await client.execute("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
        if (userExists?.rows?.length > 0) {
            return res.status(400).json({ message: "Nutzername oder E-Mail bereits registriert." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString();
        const id = uuidv4();

        await client.execute("INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)",
            [id, username, email, hashedPassword, createdAt]);

        res.status(201).json({ message: "Registrierung erfolgreich" });
    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        res.status(500).json({ message: "Serverfehler" });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await client.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (!user?.rows?.length) {
            return res.status(400).json({ message: "Ungültiger Benutzername oder Passwort" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Ungültiger Benutzername oder Passwort" });
        }

        const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username });
    } catch (error) {
        console.error("Fehler beim Login:", error);
        res.status(500).json({ message: "Serverfehler. Bitte versuchen Sie es später erneut." });
    }
});




export default router;
