<template>
  <section class="catalog-page">
    <div v-if="!searchQuery && spotlightItems.length" class="catalog-page__hero">
      <div
          class="spotlight-shell"
          @mouseenter="pauseSpotlight"
          @mouseleave="resumeSpotlight"
      >
        <transition name="spotlight-fade" mode="out-in">
          <HeroSpotlight
              :key="activeSpotlight.id"
              :item="activeSpotlight"
          />
        </transition>

        <button
            class="spotlight-nav spotlight-nav--prev"
            type="button"
            @click="goToPreviousSpotlight"
            aria-label="Vorheriger Spotlight-Film"
        >
          ‹
        </button>

        <button
            class="spotlight-nav spotlight-nav--next"
            type="button"
            @click="goToNextSpotlight"
            aria-label="Nächster Spotlight-Film"
        >
          ›
        </button>
      </div>
    </div>

    <div class="catalog-page__header">
      <div>
        <p class="catalog-page__eyebrow">Discover</p>
      </div>

      <div class="catalog-page__meta">
        <span>{{ totalResultsLabel }}</span>
        <span>Seite {{ page }} von {{ totalPages }}</span>
      </div>
    </div>

    <div v-if="!searchQuery" class="catalog-page__toolbar">
      <div class="category-rail">
        <button
            v-if="previousCategory"
            type="button"
            class="category-peek category-peek--prev"
            @click="goToPreviousCategory"
        >
          <span class="category-peek__label">{{ previousCategory.label }}</span>
        </button>

        <button
            class="category-focus"
        >
          <span class="category-focus__label">{{ activeCategoryLabel }}</span>
        </button>

        <button
            v-if="nextCategory"
            type="button"
            class="category-peek category-peek--next"
            @click="goToNextCategory"
        >
          <span class="category-peek__label">{{ nextCategory.label }}</span>
        </button>
      </div>

      <div class="catalog-page__genre">
        <label class="genre-field">
          <span class="genre-field__label">Genre</span>
          <select
              :value="selectedGenre ?? ''"
              class="genre-field__input"
              @change="handleGenreChange($event.target.value || undefined)"
          >
            <option value="">Alle Genres</option>
            <option
                v-for="genre in genres"
                :key="genre.id"
                :value="genre.id"
            >
              {{ genre.name }}
            </option>
          </select>
        </label>
      </div>
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
import PaginationBar from '../components/PaginationBar.vue'
import MediaGrid from '../components/MediaGrid.vue'
import {
  fetchGenres,
  fetchList,
  searchMulti,
  fetchSpotlightCandidates,
  getHomeMovieCategories,
} from '../lib/tmdb.js'

export default {
  name: 'MovieOverview',
  components: {
    HeroSpotlight,
    PaginationBar,
    MediaGrid,
  },
  data() {
    return {
      movies: [],
      genres: [],
      categories: getHomeMovieCategories(),
      category: 'recent_quality',
      selectedGenre: undefined,
      page: 1,
      totalPages: 1,
      totalResults: 0,
      isLoading: false,
      error: '',
      searchQuery: this.$route.query.search || '',
      spotlightItems: [],
      activeSpotlightIndex: 0,
      spotlightInterval: null,
    }
  },
  computed: {
    activeSpotlight() {
      return this.spotlightItems[this.activeSpotlightIndex] || null
    },
    activeCategoryIndex() {
      return this.categories.findIndex((item) => item.key === this.category)
    },
    activeCategory() {
      return this.categories[this.activeCategoryIndex] || this.categories[0]
    },
    activeCategoryLabel() {
      return this.activeCategory?.label || 'Filme'
    },
    activeCategoryDescription() {
      const descriptions = {
        recent_quality: 'Relativ neue Filme mit starker Bewertung und genug Relevanz, damit nicht jeder Zufallstreffer oben landet.',
        top_rated: 'Filme mit hoher Bewertung und vielen Stimmen, damit die Liste wirklich Substanz hat.',
        most_voted: 'Titel, die besonders viele Bewertungen gesammelt haben und dadurch kulturell sichtbar geworden sind.',
        popular_now: 'Aktuell populäre Filme mit solider Resonanz und zeitnaher Relevanz.',
        cinema_pick: 'Große Produktionen mit starker Außenwirkung und breiter Aufmerksamkeit.',
      }

      return descriptions[this.category] || 'Kuratiert nach Qualität, Relevanz und Resonanz.'
    },
    previousCategory() {
      if (!this.categories.length) return null
      const index = (this.activeCategoryIndex - 1 + this.categories.length) % this.categories.length
      return this.categories[index]
    },
    nextCategory() {
      if (!this.categories.length) return null
      const index = (this.activeCategoryIndex + 1) % this.categories.length
      return this.categories[index]
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
    await this.loadSpotlights()
    await this.loadMovies()
    this.startSpotlightRotation()
  },
  beforeUnmount() {
    this.stopSpotlightRotation()
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

    async loadSpotlights() {
      try {
        this.spotlightItems = await fetchSpotlightCandidates('movie', 5)
        this.activeSpotlightIndex = 0
      } catch (error) {
        console.error('Fehler beim Laden der Spotlights:', error)
        this.spotlightItems = []
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

    startSpotlightRotation() {
      this.stopSpotlightRotation()

      if (this.spotlightItems.length <= 1) return

      this.spotlightInterval = window.setInterval(() => {
        this.goToNextSpotlight()
      }, 6500)
    },

    stopSpotlightRotation() {
      if (this.spotlightInterval) {
        clearInterval(this.spotlightInterval)
        this.spotlightInterval = null
      }
    },

    pauseSpotlight() {
      this.stopSpotlightRotation()
    },

    resumeSpotlight() {
      this.startSpotlightRotation()
    },

    setSpotlight(index) {
      this.activeSpotlightIndex = index
      this.startSpotlightRotation()
    },

    goToPreviousSpotlight() {
      if (!this.spotlightItems.length) return
      this.activeSpotlightIndex =
          (this.activeSpotlightIndex - 1 + this.spotlightItems.length) % this.spotlightItems.length
      this.startSpotlightRotation()
    },

    goToNextSpotlight() {
      if (!this.spotlightItems.length) return
      this.activeSpotlightIndex =
          (this.activeSpotlightIndex + 1) % this.spotlightItems.length
    },

    async setCategory(value) {
      this.category = value
      this.page = 1
      await this.loadMovies()
    },

    async goToPreviousCategory() {
      if (!this.previousCategory) return
      await this.setCategory(this.previousCategory.key)
    },

    async goToNextCategory() {
      if (!this.nextCategory) return
      await this.setCategory(this.nextCategory.key)
    },

    async handleGenreChange(value) {
      this.selectedGenre = value ? Number(value) : undefined
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
  width: min(100% - 16px, 1280px);
  margin: 0 auto;
  padding: 1rem 0 2.5rem;
  display: grid;
  gap: 1.1rem;
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
  gap: 0.9rem;
}

.catalog-page__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.catalog-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  color: var(--muted-foreground);
  font-size: 0.84rem;
}

.catalog-page__toolbar {
  display: grid;
  gap: 0.8rem;
}

.spotlight-shell {
  position: relative;
}

.spotlight-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 12, 20, 0.42);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 2;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.spotlight-nav--prev {
  left: 0.85rem;
}

.spotlight-nav--next {
  right: 0.85rem;
}

.category-rail {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.15fr) minmax(0, 0.8fr);
  gap: 0.55rem;
  align-items: stretch;
}

.category-focus,
.category-peek {
  min-height: 4.4rem;
  border-radius: 1.15rem;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  padding: 0.8rem 0.9rem;
  text-align: left;
  display: grid;
  gap: 0.15rem;
  align-content: center;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.category-focus {
  border-color: color-mix(in oklab, var(--primary) 34%, var(--border));
  background: color-mix(in oklab, var(--primary) 10%, var(--card));
  box-shadow: var(--shadow-sm);
}

.category-focus__eyebrow,
.category-peek__hint {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
  font-weight: 700;
}

.category-focus__label,
.category-peek__label {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.15;
}

.category-peek {
  opacity: 0.82;
}

.category-peek--prev {
  text-align: left;
}

.category-peek--next {
  text-align: right;
}

.catalog-page__genre {
  display: flex;
}

.genre-field {
  display: grid;
  gap: 0.35rem;
  width: min(100%, 18rem);
}

.genre-field__label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
  font-weight: 700;
}

.genre-field__input {
  min-height: 2.7rem;
  border-radius: 0.95rem;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  padding: 0 0.85rem;
}

.catalog-page__state {
  display: grid;
  place-items: center;
  min-height: 11rem;
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  background: var(--card);
  color: var(--muted-foreground);
}

.catalog-page__state--error {
  color: #ff8f8f;
}

.spotlight-fade-enter-active,
.spotlight-fade-leave-active {
  transition: opacity 320ms ease, transform 320ms ease;
}

.spotlight-fade-enter-from,
.spotlight-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 767px) {
  .category-rail {
    grid-template-columns: 0.72fr 1fr 0.72fr;
    gap: 0.45rem;
  }

  .category-focus,
  .category-peek {
    min-height: 4rem;
    padding: 0.7rem 0.75rem;
    border-radius: 1rem;
  }

  .category-peek__label,
  .category-focus__label {
    font-size: 0.86rem;
  }

  .spotlight-nav {
    width: 2.45rem;
    height: 2.45rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(8, 12, 20, 0.34);
    color: white;
    backdrop-filter: blur(10px);
  }

  .spotlight-nav--prev {
    left: 0.2rem;
  }

  .spotlight-nav--next {
    right: 0.2rem;
  }
}

@media (min-width: 768px) {
  .catalog-page {
    width: min(100% - 32px, 1280px);
    padding: 1.5rem 0 4rem;
    gap: 1.5rem;
  }

  .catalog-page__toolbar {
    grid-template-columns: 1fr auto;
    align-items: end;
  }

  .genre-field {
    width: 16rem;
  }
}
</style>