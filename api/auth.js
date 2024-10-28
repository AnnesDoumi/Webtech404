import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js'; // Datenbankverbindung importieren
import { v4 as uuidv4 } from 'uuid'; // Für die manuelle ID-Generierung falls nötig

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Registrierungs-Route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    console.log("Angefragte Registrierungsdaten:", req.body);

    if (!username || !email || !password) {
        console.log("Fehlende Felder:", { username, email, password });
        return res.status(400).json({ message: "Bitte geben Sie alle Informationen an." });
    }

    try {
        // Überprüfen, ob der Benutzername oder die E-Mail bereits registriert ist
        const userExists = await db.execute("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
        console.log("Benutzerprüfung Ergebnis:", userExists);

        if (userExists && userExists.rows && userExists.rows.length > 0) {
            console.log("Benutzername oder E-Mail bereits registriert.");
            return res.status(400).json({ message: "Nutzername oder E-Mail bereits registriert." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdAt = new Date().toISOString(); // Zeitstempel in JavaScript generieren
        const id = uuidv4();

        // Stellen Sie sicher, dass in der Abfrage keine NOW()-Funktion verwendet wird
        const sqlQuery = "INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)";
        console.log("Auszuführender SQL-Befehl:", sqlQuery, [id, username, email, hashedPassword, createdAt]);

        const result = await db.execute(sqlQuery, [id, username, email, hashedPassword, createdAt]);

        console.log("Einfügen Ergebnis:", result);
        res.status(201).json({ message: "Registrierung erfolgreich" });
    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        res.status(500).json({ message: "Serverfehler", error: error.message });
    }
});


// Login-Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Bitte Benutzername und Passwort eingeben." });
    }

    try {
        // Benutzer anhand des Benutzernamens finden
        const user = await db.execute("SELECT * FROM users WHERE username = ?", [username]);

        if (!user || !user.rows || user.rows.length === 0) {
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
        console.error("Fehler beim Login:", error);
        res.status(500).json({ message: "Serverfehler" });
    }
});

// Geschützte Profil-Route
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.execute("SELECT username, email FROM users WHERE id = ?", [req.user.userId]);

        if (!user || !user.rows || user.rows.length === 0) {
            return res.status(404).json({ message: "Benutzer nicht gefunden." });
        }

        res.json({ message: "Profil erfolgreich geladen", user: user.rows[0] });
    } catch (error) {
        console.error("Fehler beim Laden des Profils:", error);
        res.status(500).json({ message: "Serverfehler" });
    }
});

// Middleware zur Token-Authentifizierung
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Kein Token bereitgestellt" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token ist ungültig" });
        req.user = user;
        next();
    });
}

export default router;
