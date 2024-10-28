// db.js
import { createClient } from "@libsql/client";
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    url: process.env.LIBSQL_URL,
    authToken: process.env.LIBSQL_AUTH_TOKEN,
});

export default client;
