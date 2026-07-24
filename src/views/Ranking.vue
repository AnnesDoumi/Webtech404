<template>
  <section class="ranking-page">
    <div class="ranking-hero">
      <div class="ranking-hero__copy">
        <p class="ranking-hero__eyebrow">Ranking</p>
        <h1 class="ranking-hero__title">Top bewertete Inhalte</h1>
        <p class="ranking-hero__subtitle">
          Ranke Filme und Serien nach gewichteter Bewertung, Stimmenzahl, Datum oder TMDB-Score.
        </p>
      </div>

      <div class="ranking-toolbar">
        <div class="toolbar-toggle">
          <button
              class="toggle-chip"
              :class="{ 'toggle-chip--active': mediaType === 'movie' }"
              @click="changeMediaType('movie')"
          >
            Filme
          </button>
          <button
              class="toggle-chip"
              :class="{ 'toggle-chip--active': mediaType === 'tv' }"
              @click="changeMediaType('tv')"
          >
            Serien
          </button>
        </div>

        <div class="toolbar-group">
          <label for="genre">Genre</label>
          <select id="genre" v-model="selectedGenre" @change="onFilterChange">
            <option :value="null">Alle Genres</option>
            <option
                v-for="genre in genres"
                :key="genre.id"
                :value="genre.id"
            >
              {{ genre.name }}
            </option>
          </select>
        </div>

        <div class="toolbar-group">
          <label for="sort">Sortierung</label>
          <select id="sort" v-model="sortMode" @change="onSortModeChange">
            <option value="weighted">Gewichtete Bewertung</option>
            <option value="rating">TMDB Bewertung</option>
            <option value="votes">Stimmenanzahl</option>
            <option value="date">{{ mediaType === 'movie' ? 'Veröffentlichungsdatum' : 'Ersterscheinung' }}</option>
            <option value="title">Titel</option>
          </select>
        </div>

        <button class="sort-order-button" @click="toggleSortOrder">
          {{ sortOrder === 'desc' ? 'Absteigend' : 'Aufsteigend' }}
        </button>
      </div>
    </div>

    <div class="ranking-grid">
      <article
          v-for="item in rankedItems"
          :key="`${mediaType}-${item.id}`"
          class="ranking-card"
          @click="navigateToDetail(item.id)"
      >
        <div class="ranking-card__poster-wrap">
          <img
              :src="getPoster(item.poster_path)"
              :alt="getTitle(item)"
              class="ranking-card__poster"
              loading="lazy"
          />
          <div class="ranking-card__overlay"></div>

          <div class="ranking-card__topline">
            <span class="ranking-rank">#{{ item.rank }}</span>
            <span class="ranking-chip">{{ getYear(item) }}</span>
          </div>

          <div class="ranking-card__badges">
            <span class="ranking-chip">★ {{ formatRating(item.vote_average) }}</span>
            <span class="ranking-chip">{{ formatVotes(item.vote_count) }} Votes</span>
          </div>
        </div>

        <div class="ranking-card__body">
          <h2>{{ getTitle(item) }}</h2>
          <p>{{ item.overview || 'Keine Beschreibung verfügbar.' }}</p>

          <div class="ranking-card__meta">
            <span>Weighted {{ formatRating(item.weightedRating) }}</span>
            <span>{{ mediaType === 'movie' ? 'Film' : 'Serie' }}</span>
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
  name: 'Ranking',
  data() {
    return {
      mediaType: 'movie',
      rankedItems: [],
      genres: [],
      page: 1,
      selectedGenre: null,
      sortMode: 'weighted',
      sortOrder: 'desc',
      minVotesMovie: 500,
      minVotesTv: 300,
    }
  },
  async mounted() {
    await this.fetchGenres()
    await this.fetchItems()
  },
  methods: {
    async fetchGenres() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY
      const endpoint = this.mediaType === 'movie' ? 'movie' : 'tv'

      try {
        const response = await fetch(
            `https://api.themoviedb.org/3/genre/${endpoint}/list?api_key=${apiKey}&language=de-DE`
        )
        const data = await response.json()
        this.genres = data.genres || []
      } catch (error) {
        console.error('Fehler beim Laden der Genres:', error)
        this.genres = []
      }
    },

    async fetchItems() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY
      const endpoint = this.mediaType === 'movie' ? 'movie' : 'tv'
      const minVotes = this.mediaType === 'movie' ? this.minVotesMovie : this.minVotesTv

      let url = `https://api.themoviedb.org/3/discover/${endpoint}?api_key=${apiKey}&language=de-DE&page=${this.page}&vote_count.gte=${minVotes}`

      if (this.selectedGenre) {
        url += `&with_genres=${this.selectedGenre}`
      }

      const tmdbSort = this.getTmdbSortParam()
      if (tmdbSort) {
        url += `&sort_by=${tmdbSort}`
      }

      if (this.mediaType === 'movie') {
        url += '&include_adult=false'
      }

      try {
        const response = await fetch(url)
        const data = await response.json()

        if (!data.results) {
          this.rankedItems = []
          return
        }

        const C = this.mediaType === 'movie' ? 6.5 : 6.3
        const m = this.mediaType === 'movie' ? this.minVotesMovie : this.minVotesTv

        let items = data.results
            .filter((item) => item.poster_path)
            .map((item) => {
              const R = Number(item.vote_average || 0)
              const v = Number(item.vote_count || 0)
              const weightedRating = v > 0
                  ? (v / (v + m)) * R + (m / (v + m)) * C
                  : C

              return {
                ...item,
                weightedRating,
              }
            })

        items = this.sortItemsLocally(items)

        this.rankedItems = items.map((item, index) => ({
          ...item,
          rank: index + 1 + (this.page - 1) * items.length,
        }))
      } catch (error) {
        console.error('Fehler beim Laden des Rankings:', error)
        this.rankedItems = []
      }
    },

    getTmdbSortParam() {
      if (this.sortMode === 'votes') {
        return `vote_count.${this.sortOrder}`
      }

      if (this.sortMode === 'rating') {
        return `vote_average.${this.sortOrder}`
      }

      if (this.sortMode === 'date') {
        return this.mediaType === 'movie'
            ? `primary_release_date.${this.sortOrder}`
            : `first_air_date.${this.sortOrder}`
      }

      if (this.sortMode === 'title') {
        return this.mediaType === 'movie'
            ? `original_title.${this.sortOrder}`
            : null
      }

      if (this.sortMode === 'weighted') {
        return `vote_count.desc`
      }

      return null
    },

    sortItemsLocally(items) {
      const direction = this.sortOrder === 'asc' ? 1 : -1

      return [...items].sort((a, b) => {
        if (this.sortMode === 'weighted') {
          return (a.weightedRating - b.weightedRating) * direction
        }

        if (this.sortMode === 'votes') {
          return (Number(a.vote_count || 0) - Number(b.vote_count || 0)) * direction
        }

        if (this.sortMode === 'rating') {
          return (Number(a.vote_average || 0) - Number(b.vote_average || 0)) * direction
        }

        if (this.sortMode === 'date') {
          return (this.getDateValue(a) - this.getDateValue(b)) * direction
        }

        if (this.sortMode === 'title') {
          return direction === 1
              ? this.getTitle(a).localeCompare(this.getTitle(b), 'de')
              : this.getTitle(b).localeCompare(this.getTitle(a), 'de')
        }

        return (a.weightedRating - b.weightedRating) * direction
      })
    },

    changeMediaType(type) {
      if (this.mediaType === type) return

      this.mediaType = type
      this.selectedGenre = null
      this.page = 1
      this.sortMode = 'weighted'
      this.sortOrder = 'desc'
      this.fetchGenres()
      this.fetchItems()
    },

    onFilterChange() {
      this.page = 1
      this.fetchItems()
    },

    onSortModeChange() {
      this.page = 1
      this.fetchItems()
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.fetchItems()
    },

    nextPage() {
      this.page++
      this.fetchItems()
    },

    prevPage() {
      if (this.page > 1) {
        this.page--
        this.fetchItems()
      }
    },

    getPoster(path) {
      return path
          ? `https://image.tmdb.org/t/p/w500${path}`
          : 'https://via.placeholder.com/500x750?text=No+Poster'
    },

    getTitle(item) {
      return this.mediaType === 'movie'
          ? (item.title || item.original_title || 'Unbekannt')
          : (item.name || item.original_name || 'Unbekannt')
    },

    getYear(item) {
      const value = this.mediaType === 'movie' ? item.release_date : item.first_air_date
      return value ? value.slice(0, 4) : 'N/A'
    },

    getDateValue(item) {
      const value = this.mediaType === 'movie' ? item.release_date : item.first_air_date
      return value ? new Date(value).getTime() : 0
    },

    formatRating(value) {
      return Number(value || 0).toFixed(1)
    },

    formatVotes(value) {
      return Number(value || 0).toLocaleString('de-DE')
    },

    navigateToDetail(id) {
      if (this.mediaType === 'movie') {
        this.$router.push({ name: 'movie-detail', params: { id } })
      } else {
        this.$router.push({ name: 'series-detail', params: { id } })
      }
    },
  },
}
</script>

<style scoped>
.ranking-page {
  width: min(100% - 16px, 1320px);
  margin: 0 auto;
  padding: 0.5rem 0 3rem;
  display: grid;
  gap: 1rem;

}

.ranking-hero {
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

.ranking-hero__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent);
  font-weight: 800;
}

.ranking-hero__title {
  margin: 0;
  font-size: clamp(1.9rem, 5vw, 4rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: var(--foreground);
}

.ranking-hero__subtitle {
  margin: 0.55rem 0 0;
  max-width: 58ch;
  color: var(--muted-foreground);
  font-size: 0.95rem;
  line-height: 1.6;
}

.ranking-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.75rem;
}

.toolbar-toggle {
  display: inline-flex;
  padding: 0.25rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.toggle-chip {
  min-height: 2.5rem;
  padding: 0 0.95rem;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.toggle-chip--active {
  background: var(--primary);
  color: var(--primary-foreground);
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

.ranking-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1rem;
}

.ranking-card {
  overflow: hidden;
  border-radius: 1.2rem;
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.94) 0%, rgba(8, 14, 28, 0.98) 100%);
  box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease;
}

.ranking-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.14);
}

.ranking-card__poster-wrap {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
}

.ranking-card__poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ranking-card__overlay {
  position: absolute;
  inset: 0;
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.52) 0%, rgba(10, 18, 34, 0.08) 28%, rgba(10, 18, 34, 0.82) 100%);
}

.ranking-card__topline,
.ranking-card__badges {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.ranking-card__topline {
  top: 0.75rem;
}

.ranking-card__badges {
  bottom: 0.75rem;
}

.ranking-rank,
.ranking-chip {
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

.ranking-card__body {
  display: grid;
  gap: 0.65rem;
  padding: 0.95rem;
}

.ranking-card__body h2 {
  margin: 0;
  font-size: 1.02rem;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--foreground);
}

.ranking-card__body p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.88rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ranking-card__meta {
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
  .ranking-page {
    width: min(100% - 24px, 1320px);
    gap: 1.15rem;
  }

  .ranking-hero {
    padding: 1.15rem;
  }
}
</style>