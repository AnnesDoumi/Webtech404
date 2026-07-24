import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

import authRoutes from './api/auth.js'
import favoritesRoutes from './api/favorites.js'
import foldersRoutes from './api/folders.js'
import seriesFavoritesRouter from './api/seriesFavorites.js'
import favoritesCategoriesRoutes from './api/favoritesCategories.js'

dotenv.config()

const app = express()
const __dirname = path.resolve()

const allowedOrigins = [
    'https://webtech404.vercel.app',
    'http://localhost:5173',
]

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error('CORS nicht erlaubt für diese Origin'))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.use(express.json())
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use('/api/auth', authRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/folders', foldersRoutes)
app.use('/api/series-favorites', seriesFavoritesRouter)
app.use('/api/favoritesCategories', favoritesCategoriesRoutes)

app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
        res.type('application/javascript')
    } else if (req.path.endsWith('.css')) {
        res.type('text/css')
    }
    next()
})

app.use(express.static(path.join(__dirname, 'dist')))

app.get('*', (req, res) => {
    if (req.path.startsWith('/assets')) {
        const filePath = path.join(__dirname, 'dist', req.path)

        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath)
        }
    }

    return res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

export default app

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001

    app.listen(PORT, () => {
        console.log(`Server läuft lokal auf http://localhost:${PORT}`)
    })
}