import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/auth.js';
import favoritesRoutes from './api/favorites.js';
import client from './db.js'; // Import the database client

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Route setup
app.use('/api/auth', authRoutes);
app.use('/api/user/favorites', favoritesRoutes);

// Port setup and server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    testDBConnection(); // Test the DB connection when the server starts
});

// Function to test the DB connection
async function testDBConnection() {
    try {
        const result = await client.execute('SELECT 1'); // Simple test query
        console.log('Connected to Turso:', result);
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

// server.js
app.use(express.static('dist')); // Ordner mit kompiliertem Vue.js-Code

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

