<template>
  <section class="catalog-page">
    <div class="catalog-page__hero" v-if="heroItem">
      <HeroSpotlight :item="heroItem" />
    </div>

    <div class="catalog-page__header">
      <div>
        <p class="catalog-page__eyebrow">Discover</p>
        <h1 class="catalog-page__title">
          {{ searchQuery ? 'Suchergebnisse' : 'Filme' }}
        </h1>
        <p class="catalog-page__subtitle">
          {{
            searchQuery
                ? `Ergebnisse für „${searchQuery}“`
                : 'Durchsuche trendende, beliebte und top-bewertete Filme in einem moderneren Katalog.'
          }}
        </p>
      </div>

      <div class="catalog-page__meta">
        <span>{{ totalResultsLabel }}</span>
        <span>Seite {{ page }} von {{ totalPages }}</span>
      </div>
    </div>

    <div class="catalog-page__toolbar">
      <DiscoverFilters
          :media="'movie'"
          :category="category"
          :genre-id="selectedGenre"
          :genres="genres"
          @category-change="handleCategoryChange"
          @genre-change="handleGenreChange"
      />
    </div>

    <div v-if="isLoading" class="catalog-page__state">
      <p>Filme werden geladen…</p>
    </div>

    <div v-else-if="error" class="catalog-page__state catalog-page__state--error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="movies.length" class="catalog-page__results">
      <MediaGrid :items="movies" />
    </div>

    <div v-else class="catalog-page__state">
      <p>Keine Filme gefunden.</p>
    </div>

    <PaginationBar
        :page="page"
        :total-pages="totalPages"
        @page-change="handlePageChange"
    />
  </section>
</template>

<script>
import HeroSpotlight from '../components/HeroSpotlight.vue'
import DiscoverFilters from '../components/DiscoverFilters.vue'
import PaginationBar from '../components/PaginationBar.vue'
import MediaGrid from '../components/MediaGrid.vue'
import { fetchGenres, fetchList, searchMulti } from '../lib/tmdb.js'


export default {
  name: 'MovieOverview',
  components: {
    HeroSpotlight,
    DiscoverFilters,
    PaginationBar,
    MediaGrid,
  },
  data() {
    return {
      movies: [],
      genres: [],
      category: 'trending',
      selectedGenre: undefined,
      page: 1,
      totalPages: 1,
      totalResults: 0,
      isLoading: false,
      error: '',
      searchQuery: this.$route.query.search || '',
    }
  },
  computed: {
    heroItem() {
      return this.searchQuery ? this.movies[0] || null : this.movies[0] || null
    },
    totalResultsLabel() {
      if (this.totalResults) {
        return `${this.totalResults.toLocaleString('de-DE')} Ergebnisse`
      }

      return `${this.movies.length} Ergebnisse`
    },
  },
  async mounted() {
    await this.loadGenres()
    await this.loadMovies()
  },
  watch: {
    '$route.query.search': {
      immediate: false,
      async handler(newSearch) {
        this.searchQuery = newSearch || ''
        this.page = 1
        await this.loadMovies()
      },
    },
  },
  methods: {
    async loadGenres() {
      try {
        this.genres = await fetchGenres('movie')
      } catch (error) {
        console.error('Fehler beim Laden der Genres:', error)
        this.genres = []
      }
    },

    async loadMovies() {
      this.isLoading = true
      this.error = ''

      try {
        if (this.searchQuery) {
          const data = await searchMulti(this.searchQuery, this.page)
          this.movies = data.results.filter((item) => item.mediaType === 'movie')
          this.totalPages = data.totalPages || 1
          this.totalResults = data.totalResults || this.movies.length
        } else {
          const data = await fetchList({
            media: 'movie',
            category: this.category,
            page: this.page,
            genreId: this.selectedGenre,
          })

          this.movies = data.results.filter((item) => item.mediaType === 'movie')
          this.totalPages = data.totalPages || 1
          this.totalResults = data.totalResults || this.movies.length
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Filme:', error)
        this.error = 'Beim Laden der Filme ist ein Fehler aufgetreten.'
        this.movies = []
        this.totalPages = 1
        this.totalResults = 0
      } finally {
        this.isLoading = false
      }
    },

    async handleCategoryChange(value) {
      this.category = value
      this.page = 1
      await this.loadMovies()
    },

    async handleGenreChange(value) {
      this.selectedGenre = value
      this.page = 1
      await this.loadMovies()
    },

    async handlePageChange(value) {
      this.page = value
      await this.loadMovies()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  },
}
</script>

<style scoped>
.catalog-page {
  width: min(100% - 32px, 1280px);
  margin: 0 auto;
  padding: 1.5rem 0 3rem;
  display: grid;
  gap: 1.5rem;
}

.catalog-page__hero,
.catalog-page__toolbar,
.catalog-page__results,
.catalog-page__header,
.catalog-page__state {
  width: 100%;
}

.catalog-page__header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.catalog-page__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.catalog-page__title {
  margin: 0;
  font-size: clamp(2rem, 3vw, 3.5rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.catalog-page__subtitle {
  margin: 0.75rem 0 0;
  color: var(--muted-foreground);
  max-width: 46rem;
  line-height: 1.7;
}

.catalog-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--muted-foreground);
  font-size: 0.92rem;
}

.catalog-page__toolbar {
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  background: var(--card);
  box-shadow: var(--shadow-sm);
  padding: 1rem;
}

.catalog-page__state {
  display: grid;
  place-items: center;
  min-height: 12rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  background: var(--card);
  color: var(--muted-foreground);
}

.catalog-page__state--error {
  color: #ff8f8f;
}

@media (min-width: 768px) {
  .catalog-page {
    padding: 2rem 0 4rem;
    gap: 2rem;
  }

  .catalog-page__toolbar {
    padding: 1.25rem;
  }
}
</style>