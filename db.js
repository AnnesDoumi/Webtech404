import pg from 'pg'; // pg als Standard exportieren

const { Pool } = pg; // Extrahiere Pool aus dem Standardexport

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export default {
    query: (text, params) => pool.query(text, params),
};
