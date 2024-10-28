import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import client from './db.js';  // Verbindung zur Datenbank

dotenv.config();

const app = express();
app.use(express.json());

// CORS-Konfiguration
app.use(cors({
    origin: ['https://webtech404.vercel.app', 'http://localhost:5173']
}));

// JWT-Secret aus Umgebungsvariablen
const JWT_SECRET = process.env.JWT_SECRET;

// Authentifizierungs-Middleware (früher `authMiddleware.js`)
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Kein Token bereitgestellt" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token ist ungültig" });
        req.user = user;
        next();
    });
};

// Authentifizierungsrouten (früher `auth.js`)

// Registrierung
app.post('/api/auth/register', async (req, res) => {
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
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Logik für die Benutzerauthentifizierung
        const user = await db.execute("SELECT * FROM users WHERE username = ?", [username]);

        if (!user?.rows?.length) {
            return res.status(400).json({ error: true, message: "Ungültiger Benutzername oder Passwort" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: true, message: "Ungültiger Benutzername oder Passwort" });
        }

        // Erfolgsfall: Token generieren und als JSON zurückgeben
        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, username });
    } catch (error) {
        console.error("Fehler beim Login:", error);
        res.status(500).json({ error: true, message: "Serverfehler. Bitte versuchen Sie es später erneut." });
    }
});


// Favoriten-Routen (früher `favorites.js`)

// Abfrage von Favoriten des Benutzers
app.get('/api/favorites', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await client.execute("SELECT movie_id FROM favorites WHERE user_id = ?", [userId]);

        if (!result.rows || result.rows.length === 0) {
            return res.json([]);  // Leere Liste zurückgeben
        }

        const favoriteMovies = await Promise.all(result.rows.map(async (row) => {
            const movieId = row.movie_id;
            // Hier sollte ein externer API-Aufruf zur Filmdatenbank erfolgen
            return { id: movieId, title: `Movie ${movieId}`, poster_path: '/path/to/poster.jpg' }; // Beispiel-Daten
        }));

        res.json(favoriteMovies);
    } catch (error) {
        console.error("Fehler beim Abrufen der Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Abrufen der Favoriten" });
    }
});

// Entfernen eines Favoriten
app.delete('/api/favorites/:movieId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const movieId = req.params.movieId;

    try {
        await client.execute("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?", [userId, movieId]);
        res.status(200).json({ message: "Favorit erfolgreich entfernt" });
    } catch (error) {
        console.error("Fehler beim Entfernen des Favoriten:", error);
        res.status(500).json({ message: "Fehler beim Entfernen des Favoriten" });
    }
});

// Statische Dateien für das Vue-Frontend aus dem 'dist'-Ordner servieren
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-All Route für Vue-Router (Single-Page-Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
