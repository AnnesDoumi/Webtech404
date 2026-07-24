<template>
  <section class="series-overview">
    <div class="series-overview__hero">
      <div class="series-overview__hero-copy">
        <p class="series-overview__eyebrow">Discover</p>
        <h1 class="series-overview__title">Serien Übersicht</h1>
        <p class="series-overview__subtitle">
          Entdecke Serien mit hochwertiger Kartenansicht, sortiert nach Relevanz, Datum oder Stimmen.
        </p>
      </div>

      <div class="series-overview__toolbar">
        <div class="toolbar-group">
          <label for="sort">Sortieren nach</label>
          <select id="sort" v-model="sortOption" @change="fetchSeries">
            <option value="">Gewichtete Bewertung</option>
            <option value="first_air_date">Ersterscheinungsdatum</option>
            <option value="vote_count">Stimmenanzahl</option>
            <option value="name">Alphabetisch</option>
          </select>
        </div>

        <button class="sort-order-button" @click="toggleSortOrder">
          {{ sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend' }}
        </button>
      </div>
    </div>

    <div class="series-grid">
      <article
          v-for="series in seriesList"
          :key="series.id"
          class="series-card"
          @click="navigateToDetail(series.id)"
      >
        <div class="series-card__poster-wrap">
          <img
              :src="getSeriesPoster(series.poster_path)"
              :alt="series.name || 'Serien Poster'"
              class="series-card__poster"
              loading="lazy"
          />
          <div class="series-card__overlay"></div>

          <div class="series-card__chips series-card__chips--top">
            <span class="series-chip">{{ getYear(series.first_air_date) }}</span>
            <span class="series-chip">★ {{ formatRating(series.vote_average) }}</span>
          </div>
        </div>

        <div class="series-card__body">
          <h2>{{ series.name }}</h2>
          <p>{{ series.overview || 'Keine Beschreibung verfügbar.' }}</p>

          <div class="series-card__meta">
            <span>{{ formatVotes(series.vote_count) }} Stimmen</span>
            <span>Score {{ formatWeightedRating(series.weightedRating) }}</span>
          </div>
        </div>
      </article>
    </div>

    <div class="pagination">
      <button class="pagination-button" @click="prevPage" :disabled="page <= 1">
        Zurück
      </button>
      <span class="pagination__label">Seite {{ page }}</span>
      <button class="pagination-button" @click="nextPage">
        Weiter
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SeriesOverview',
  data() {
    return {
      seriesList: [],
      genres: [],
      searchQuery: '',
      page: 1,
      selectedGenre: null,
      sortOption: '',
      sortOrder: 'desc',
    }
  },
  async mounted() {
    await this.fetchGenres()
    await this.fetchSeries()
  },
  methods: {
    async fetchGenres() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY

      try {
        const response = await fetch(
            `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=de-DE`
        )
        const data = await response.json()
        this.genres = data.genres || []
      } catch (error) {
        console.error('Fehler beim Abrufen der Genres:', error)
        this.genres = []
      }
    },

    async fetchSeries() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY
      let url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=de-DE&page=${this.page}`

      if (this.selectedGenre) {
        url += `&with_genres=${this.selectedGenre}`
      }

      if (this.sortOption && this.sortOption !== 'name') {
        url += `&sort_by=${this.sortOption}.${this.sortOrder}`
      }

      try {
        const response = await fetch(url)
        const data = await response.json()

        if (!data.results) {
          this.seriesList = []
          return
        }

        const C = 6.5
        const m = 500

        let series = data.results
            .filter((item) => item.poster_path)
            .map((item) => {
              const R = Number(item.vote_average || 0)
              const v = Number(item.vote_count || 0)
              const weightedRating = (v / (v + m)) * R + (m / (v + m)) * C
              return { ...item, weightedRating }
            })

        if (this.sortOption === 'name') {
          series.sort((a, b) =>
              this.sortOrder === 'asc'
                  ? a.name.localeCompare(b.name, 'de')
                  : b.name.localeCompare(a.name, 'de')
          )
        } else if (!this.sortOption) {
          series.sort((a, b) =>
              this.sortOrder === 'asc'
                  ? a.weightedRating - b.weightedRating
                  : b.weightedRating - a.weightedRating
          )
        }

        this.seriesList = series
      } catch (error) {
        console.error('Fehler beim Abrufen der Serien:', error)
        this.seriesList = []
      }
    },

    async searchSeries() {
      if (this.searchQuery) {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY

        try {
          const response = await fetch(
              `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(
                  this.searchQuery
              )}&page=${this.page}`
          )
          const data = await response.json()
          this.seriesList = (data.results || []).filter((series) => series.poster_path)
        } catch (error) {
          console.error('Fehler bei der Seriensuche:', error)
          this.seriesList = []
        }
      } else {
        this.fetchSeries()
      }
    },

    filterByCategory(genreId) {
      this.selectedGenre = genreId
      this.page = 1
      this.fetchSeries()
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.fetchSeries()
    },

    nextPage() {
      this.page++
      this.fetchSeries()
    },

    prevPage() {
      if (this.page > 1) {
        this.page--
        this.fetchSeries()
      }
    },

    getSeriesPoster(path) {
      return path
          ? `https://image.tmdb.org/t/p/w500${path}`
          : 'https://via.placeholder.com/500x750?text=No+Poster+Available'
    },

    navigateToDetail(seriesId) {
      this.$router.push({ name: 'series-detail', params: { id: seriesId } })
    },

    getYear(date) {
      return date ? date.slice(0, 4) : 'N/A'
    },

    formatRating(value) {
      return Number(value || 0).toFixed(1)
    },

    formatWeightedRating(value) {
      return Number(value || 0).toFixed(1)
    },

    formatVotes(value) {
      return Number(value || 0).toLocaleString('de-DE')
    },
  },
  watch: {
    '$route.query.search'(newSearch) {
      this.searchQuery = newSearch || ''
      this.page = 1
      this.searchSeries()
    },
  },
}
</script>

<style scoped>
.series-overview {
  width: min(100% - 16px, 1320px);
  margin: 0 auto;
  padding: 0.5rem 0 3rem;
  display: grid;
  gap: 1rem;
}

.series-overview__hero {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.4rem;
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%);
  box-shadow:
      0 16px 40px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.series-overview__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent);
  font-weight: 800;
}

.series-overview__title {
  margin: 0;
  font-size: clamp(1.9rem, 5vw, 4rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: var(--foreground);
}

.series-overview__subtitle {
  margin: 0.55rem 0 0;
  max-width: 58ch;
  color: var(--muted-foreground);
  font-size: 0.95rem;
  line-height: 1.6;
}

.series-overview__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.75rem;
}

.toolbar-group {
  display: grid;
  gap: 0.35rem;
}

.toolbar-group label {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted-foreground);
  font-weight: 700;
}

.toolbar-group select,
.sort-order-button,
.pagination-button {
  min-height: 2.7rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--foreground);
  font: inherit;
}

.sort-order-button,
.pagination-button {
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.sort-order-button:hover,
.pagination-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.07);
}

.pagination-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1rem;
}

.series-card {
  overflow: hidden;
  border-radius: 1.2rem;
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.94) 0%, rgba(8, 14, 28, 0.98) 100%);
  box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.series-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.series-card__poster-wrap {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
}

.series-card__poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.series-card__overlay {
  position: absolute;
  inset: 0;
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.46) 0%, rgba(10, 18, 34, 0.06) 24%, rgba(10, 18, 34, 0.74) 100%);
}

.series-card__chips {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.series-card__chips--top {
  top: 0.75rem;
}

.series-chip {
  min-height: 1.9rem;
  padding: 0 0.68rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 0.73rem;
  font-weight: 700;
  color: white;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.series-card__body {
  display: grid;
  gap: 0.65rem;
  padding: 0.95rem;
}

.series-card__body h2 {
  margin: 0;
  font-size: 1.02rem;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--foreground);
}

.series-card__body p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.88rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.series-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: rgba(220, 228, 245, 0.68);
  font-size: 0.78rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 0.35rem;
}

.pagination__label {
  color: var(--muted-foreground);
  font-size: 0.92rem;
}

@media (min-width: 768px) {
  .series-overview {
    width: min(100% - 24px, 1320px);
    gap: 1.15rem;
  }

  .series-overview__hero {
    grid-template-columns: 1fr auto;
    align-items: end;
    padding: 1.15rem;
  }
}
</style>