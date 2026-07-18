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
        voteCount: raw.vote_count || 0,
        popularity: raw.popularity || 0,
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

function buildQuery(params = {}) {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        query.set(key, String(value))
    })

    return query.toString()
}

function getDateMonthsAgo(months = 18) {
    const date = new Date()
    date.setMonth(date.getMonth() - months)
    return date.toISOString().slice(0, 10)
}

export async function discoverMedia(media, options = {}) {
    const {
        page = 1,
        sortBy = 'popularity.desc',
        genreId = null,
        minVotes = null,
        minRating = null,
        fromDate = null,
        toDate = null,
        includeAdult = false,
    } = options

    const query = buildQuery({
        page,
        sort_by: sortBy,
        with_genres: genreId || undefined,
        'vote_count.gte': minVotes,
        'vote_average.gte': minRating,
        'primary_release_date.gte': media === 'movie' ? fromDate : undefined,
        'primary_release_date.lte': media === 'movie' ? toDate : undefined,
        'first_air_date.gte': media === 'tv' ? fromDate : undefined,
        'first_air_date.lte': media === 'tv' ? toDate : undefined,
        include_adult: includeAdult ? 'true' : 'false',
    })

    const data = await tmdbFetch(`/discover/${media}?${query}`)

    return {
        page: data.page,
        totalPages: Math.min(data.total_pages || 1, 500),
        totalResults: data.total_results || data.results.length || 0,
        results: (data.results || []).map((r) => normalizeTmdbItem(r, media)),
    }
}

export async function fetchSpotlightCandidates(media = 'movie', limit = 5) {
    const fromDate = getDateMonthsAgo(18)

    const data = await discoverMedia(media, {
        page: 1,
        sortBy: 'vote_average.desc',
        minVotes: 1200,
        minRating: 6.8,
        fromDate,
    })

    const ranked = [...data.results]
        .filter((item) => item.backdropPath && item.posterPath)
        .map((item) => {
            const score =
                item.voteAverage * 0.7 +
                Math.min(item.voteCount / 4000, 1.5) +
                Math.min(item.popularity / 100, 1)

            return {
                ...item,
                spotlightScore: score,
            }
        })
        .sort((a, b) => b.spotlightScore - a.spotlightScore)

    return ranked.slice(0, limit)
}

export function getHomeMovieCategories() {
    const fromRecent = getDateMonthsAgo(18)
    const fromFresh = getDateMonthsAgo(8)

    return [
        {
            key: 'recent_quality',
            label: 'Neu & Beliebt',
            query: {
                sortBy: 'primary_release_date.desc',
                minVotes: 500,
                minRating: 6.8,
                fromDate: fromFresh,
            },
        },
        {
            key: 'top_rated',
            label: 'Gut bewertet',
            query: {
                sortBy: 'vote_average.desc',
                minVotes: 2500,
                minRating: 7.0,
                fromDate: fromRecent,
            },
        },
        {
            key: 'most_voted',
            label: 'Viele Bewertungen',
            query: {
                sortBy: 'vote_count.desc',
                minVotes: 3000,
                minRating: 6.5,
            },
        },
        {
            key: 'popular_now',
            label: 'Aktuell',
            query: {
                sortBy: 'popularity.desc',
                minVotes: 400,
                minRating: 6.3,
                fromDate: fromRecent,
            },
        },
        {
            key: 'cinema_pick',
            label: 'Kino',
            query: {
                sortBy: 'revenue.desc',
                minVotes: 1000,
                minRating: 6.7,
            },
        },
    ]
}

export async function fetchHomeCategory(media, categoryKey, page = 1, genreId = null) {
    const categories = getHomeMovieCategories()
    const category = categories.find((entry) => entry.key === categoryKey)

    if (!category) {
        throw new Error(`Unbekannte Home-Kategorie: ${categoryKey}`)
    }

    return discoverMedia(media, {
        page,
        genreId,
        ...category.query,
    })
}

export async function fetchList({ media, category, page = 1, genreId }) {
    if (genreId) {
        return discoverMedia(media, {
            page,
            genreId,
            sortBy: category === 'top_rated' ? 'vote_average.desc' : 'popularity.desc',
            minVotes: category === 'top_rated' ? 300 : null,
            minRating: category === 'top_rated' ? 6.5 : null,
        })
    }

    const homeCategoryKeys = getHomeMovieCategories().map((entry) => entry.key)
    if (homeCategoryKeys.includes(category)) {
        return fetchHomeCategory(media, category, page)
    }

    let path = ''

    if (category === 'trending') {
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