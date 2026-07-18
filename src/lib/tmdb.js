const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function tmdbImage(path, size = 'w500') {
    if (!path) return null
    return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function normalizeTmdbItem(raw, fallbackType = 'movie') {
    const mediaType = raw.media_type === 'tv' || fallbackType === 'tv' ? 'tv' : 'movie'

    return {
        id: raw.id,
        mediaType,
        title: raw.title || raw.name || 'Ohne Titel',
        posterPath: raw.poster_path || null,
        backdropPath: raw.backdrop_path || null,
        overview: raw.overview || '',
        releaseDate: raw.release_date || raw.first_air_date || null,
        voteAverage: raw.vote_average || 0,
        genreIds: raw.genre_ids || [],
    }
}

async function tmdbFetch(path) {
    if (!TMDB_API_KEY) {
        throw new Error('TMDB-API-Key fehlt. Bitte VITE_TMDB_API_KEY setzen.')
    }

    const separator = path.includes('?') ? '&' : '?'
    const url = `${TMDB_BASE_URL}${path}${separator}api_key=${TMDB_API_KEY}&language=de-DE`

    const res = await fetch(url, {
        headers: {
            accept: 'application/json',
        },
    })

    if (!res.ok) {
        throw new Error(`TMDB-Anfrage fehlgeschlagen (${res.status})`)
    }

    return res.json()
}

export async function fetchList({ media, category, page = 1, genreId }) {
    let path = ''

    if (genreId) {
        const sort = category === 'top_rated' ? 'vote_average.desc' : 'popularity.desc'
        const vote = category === 'top_rated' ? '&vote_count.gte=200' : ''
        path = `/discover/${media}?sort_by=${sort}${vote}&with_genres=${genreId}&page=${page}`
    } else if (category === 'trending') {
        path = `/trending/${media}/week?page=${page}`
    } else if (category === 'now_playing') {
        path = media === 'movie'
            ? `/movie/now_playing?page=${page}`
            : `/tv/on_the_air?page=${page}`
    } else {
        path = `/${media}/${category}?page=${page}`
    }

    const data = await tmdbFetch(path)

    return {
        page: data.page,
        totalPages: Math.min(data.total_pages || 1, 500),
        totalResults: data.total_results || data.results.length || 0,
        results: (data.results || []).map((r) => normalizeTmdbItem(r, media)),
    }
}

export async function searchMulti(query, page = 1) {
    const data = await tmdbFetch(
        `/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
    )

    return {
        page: data.page,
        totalPages: Math.min(data.total_pages || 1, 500),
        totalResults: data.total_results || data.results.length || 0,
        results: (data.results || [])
            .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
            .map((r) => normalizeTmdbItem(r, r.media_type)),
    }
}

export async function fetchGenres(media) {
    const data = await tmdbFetch(`/genre/${media}/list`)
    return data.genres || []
}