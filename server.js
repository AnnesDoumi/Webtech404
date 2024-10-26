// server.js
const express = require('express');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favorites');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Erlaubt JSON-Parsing für Requests

// API-Routen
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes); // Favoriten-Routen

// Start des Servers
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend-Server läuft auf Port ${PORT}`));
