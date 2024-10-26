// categories.js
const express = require('express');
const db = require('./db');
const router = express.Router();

// CRUD-Routen für Kategorien
router.post('/', async (req, res) => { /* Hinzufügen */ });
router.put('/:id', async (req, res) => { /* Bearbeiten */ });
router.delete('/:id', async (req, res) => { /* Löschen */ });
router.get('/', async (req, res) => { /* Anzeigen */ });

module.exports = router;
