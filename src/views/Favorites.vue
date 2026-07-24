<template>
  <section class="favorites-page">
    <div v-if="!isLoggedIn" class="auth-gate">
      <div class="auth-gate__card">
        <div class="auth-gate__icon">★</div>
        <p class="auth-gate__eyebrow">Favoriten</p>
        <h1 class="auth-gate__title">Bitte zuerst einloggen</h1>
        <p class="auth-gate__text">
          Deine Favoriten, Notizen und Kategorien sind nur verfügbar, wenn du angemeldet bist.
        </p>

        <div class="auth-gate__actions">
          <router-link :to="{ name: 'login' }" class="primary-action">
            Zum Login
          </router-link>
        </div>
      </div>
    </div>

    <template v-else>
      <header class="favorites-hero">
        <div>
          <p class="favorites-hero__eyebrow">Library</p>
          <h1 class="favorites-hero__title">Meine Favoriten</h1>
          <p class="favorites-hero__subtitle">
            Verwalte Filme und Serien, bearbeite Notizen und organisiere deine Sammlung in Kategorien.
          </p>
        </div>

        <div class="favorites-stats">
          <article class="stat-card">
            <span class="stat-card__label">Filme</span>
            <strong class="stat-card__value">{{ favorites.length }}</strong>
          </article>
          <article class="stat-card">
            <span class="stat-card__label">Serien</span>
            <strong class="stat-card__value">{{ seriesFavorites.length }}</strong>
          </article>
          <article class="stat-card">
            <span class="stat-card__label">Kategorien</span>
            <strong class="stat-card__value">{{ categories.length }}</strong>
          </article>
        </div>
      </header>

      <section class="favorites-toolbar panel">
        <div class="search-filter search-filter--inline">
          <div class="filter-field filter-field--search">
            <input
                v-model="searchQuery"
                placeholder="Suche nach Titel, Genre oder Notiz"
                class="toolbar-input"
            />
          </div>

          <div class="filter-field">
            <select v-model="yearFilter" class="toolbar-select">
              <option value="">Erscheinungsjahr</option>
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <div class="filter-field">
            <select v-model="genreFilter" class="toolbar-select">
              <option value="">Genre</option>
              <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
            </select>
          </div>
        </div>
      </section>

      <section class="favorites-categories panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Organisation</p>
            <h2>Kategorien</h2>
          </div>
        </div>

        <div v-if="categories.length" class="category-list">
          <article v-for="category in categories" :key="category.id" class="category-pill">
            <router-link
                :to="{ name: 'category-detail', params: { id: category.id } }"
                class="category-pill__link"
            >
              {{ category.name }}
              <span>{{ category.count }}</span>
            </router-link>
            <button class="icon-button" @click="deleteCategory(category.id)" aria-label="Kategorie löschen">
              🗑
            </button>
          </article>
        </div>

        <div v-else class="inline-empty">
          Noch keine Kategorien vorhanden.
        </div>

        <div class="category-create">
          <input
              type="text"
              v-model="newCategoryName"
              placeholder="Neue Kategorie hinzufügen"
              class="toolbar-input"
          />
          <button class="primary-button" @click="addCategory">Hinzufügen</button>
        </div>
      </section>

      <template v-if="!favorites.length && !seriesFavorites.length">
        <section class="panel empty-state">
          <div class="empty-state__icon">♡</div>
          <h2>Noch keine Favoriten</h2>
          <p>
            Sobald du Filme oder Serien speicherst, erscheinen sie hier zusammen mit Notizen und Filtern.
          </p>
        </section>
      </template>

      <template v-else>
        <section class="favorites-section">
          <div class="section-head">
            <div>
              <p class="section-kicker">Movies</p>
              <h2>Filme</h2>
            </div>
            <span class="section-count">{{ filteredMovies.length }}</span>
          </div>

          <draggable :list="filteredMovies" itemKey="id" @end="onDragEnd" class="favorites-grid">
            <template #item="{ element }">
              <article class="favorite-card" draggable="true" @dragstart="onDragStart(element, 'movie')">
                <div class="favorite-card__poster-wrap">
                  <img :src="element.poster" :alt="element.title" class="favorite-card__poster" />
                  <div class="favorite-card__overlay"></div>
                  <div class="favorite-card__top">
                    <span class="card-chip">{{ element.releaseYear || 'N/A' }}</span>
                    <span class="card-chip">{{ element.genre?.split(', ')[0] || 'Genre' }}</span>
                  </div>
                </div>

                <div class="favorite-card__body">
                  <h3>{{ element.title }}</h3>

                  <div class="note-box" @dblclick="editNote(element, 'movie')">
                    <p v-if="!element.isEditing">
                      {{ element.note?.trim() ? element.note : 'Notiz hinzufügen' }}
                    </p>
                    <textarea
                        v-else
                        v-model="element.note"
                        @keyup.enter="saveNote(element, 'movie')"
                        @blur="cancelEdit(element)"
                        rows="3"
                        class="note-input"
                    ></textarea>
                  </div>

                  <select
                      v-model="element.selectedCategory"
                      @change="assignToCategory(element.id, element.selectedCategory, 'movie')"
                      class="toolbar-select"
                  >
                    <option value="">Kategorie wählen</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>

                  <button class="danger-button" @click="deleteFavorite(element, 'movie')">
                    Löschen
                  </button>
                </div>
              </article>
            </template>
          </draggable>
        </section>

        <section class="favorites-section">
          <div class="section-head">
            <div>
              <p class="section-kicker">Series</p>
              <h2>Serien</h2>
            </div>
            <span class="section-count">{{ filteredSeries.length }}</span>
          </div>

          <draggable :list="filteredSeries" itemKey="id" @end="onDragEnd" class="favorites-grid">
            <template #item="{ element }">
              <article class="favorite-card" draggable="true" @dragstart="onDragStart(element, 'series')">
                <div class="favorite-card__poster-wrap">
                  <img :src="element.poster" :alt="element.title" class="favorite-card__poster" />
                  <div class="favorite-card__overlay"></div>
                  <div class="favorite-card__top">
                    <span class="card-chip">{{ element.releaseYear || 'N/A' }}</span>
                    <span class="card-chip">{{ element.genre?.split(', ')[0] || 'Genre' }}</span>
                  </div>
                </div>

                <div class="favorite-card__body">
                  <h3>{{ element.title }}</h3>

                  <div class="note-box" @dblclick="editNote(element, 'series')">
                    <p v-if="!element.isEditing">
                      {{ element.note?.trim() ? element.note : 'Notiz hinzufügen' }}
                    </p>
                    <textarea
                        v-else
                        v-model="element.note"
                        @keyup.enter="saveNote(element, 'series')"
                        @blur="cancelEdit(element)"
                        rows="3"
                        class="note-input"
                    ></textarea>
                  </div>

                  <button class="danger-button" @click="deleteFavorite(element, 'series')">
                    Löschen
                  </button>
                </div>
              </article>
            </template>
          </draggable>
        </section>
      </template>
    </template>
  </section>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'FavoritesPage',
  components: { draggable },
  data() {
    return {
      folders: [],
      favorites: [],
      seriesFavorites: [],
      moviesInFolders: [],
      seriesInFolders: [],
      currentFolder: null,
      newFolderName: '',
      searchQuery: '',
      yearFilter: '',
      genreFilter: '',
      genres: [],
      draggedMovie: null,
      categories: [],
      newCategoryName: '',
      isLoading: false,
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    },
    filteredMovies() {
      return this.filterItems(this.favorites)
    },
    filteredSeries() {
      return this.filterItems(this.seriesFavorites)
    },
    years() {
      const allYears = [
        ...new Set([...this.favorites, ...this.seriesFavorites].map((item) => item.releaseYear)),
      ].filter(Boolean)

      return allYears.sort((a, b) => Number(b) - Number(a))
    },
  },
  methods: {
    filterItems(items) {
      let filtered = items

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
            (item) =>
                item.title.toLowerCase().includes(query) ||
                (item.genre && item.genre.toLowerCase().includes(query)) ||
                (item.note && item.note.toLowerCase().includes(query))
        )
      }

      if (this.yearFilter) {
        filtered = filtered.filter((item) => item.releaseYear === this.yearFilter)
      }

      if (this.genreFilter) {
        filtered = filtered.filter(
            (item) => item.genre && item.genre.toLowerCase().includes(this.genreFilter.toLowerCase())
        )
      }

      return filtered
    },

    async fetchFavorites() {
      if (!this.isLoggedIn) return

      this.isLoading = true

      try {
        const token = localStorage.getItem('token')

        const folderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/folders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const movieResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const seriesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/series-favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const folderData = await folderResponse.json()
        const movieData = await movieResponse.json()
        const seriesData = await seriesResponse.json()

        this.folders = folderData.folders || []
        this.moviesInFolders = folderData.moviesInFolders || []
        this.seriesInFolders = folderData.seriesInFolders || []

        this.favorites = await Promise.all(
            (movieData || []).map((fav) => this.fetchDetails(fav.movie_id, 'movie', fav.note))
        )

        this.seriesFavorites = await Promise.all(
            (seriesData || []).map((fav) => this.fetchDetails(fav.series_id, 'tv', fav.note))
        )

        this.extractGenres()
      } catch (error) {
        console.error('Fehler beim Laden der Favoriten:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchDetails(id, type, note) {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY

      try {
        const response = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=de-DE`)
        const data = await response.json()

        return {
          id,
          type: type === 'movie' ? 'movie' : 'series',
          title: type === 'movie' ? data.title : data.name,
          poster: data.poster_path
              ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Poster',
          releaseYear: data.release_date
              ? data.release_date.split('-')[0]
              : data.first_air_date?.split('-')[0] || '',
          genre: data.genres?.map((g) => g.name).join(', ') || '',
          note: note || '',
          isEditing: false,
          selectedCategory: '',
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Details:', error)
        return {
          id,
          type: type === 'movie' ? 'movie' : 'series',
          title: 'Unbekannt',
          poster: 'https://via.placeholder.com/500x750?text=No+Poster',
          releaseYear: '',
          genre: '',
          note: note || '',
          isEditing: false,
          selectedCategory: '',
        }
      }
    },

    editNote(item) {
      item.isEditing = true
    },

    cancelEdit(item) {
      item.isEditing = false
    },

    async saveNote(item, type) {
      const endpoint = type === 'movie' ? 'favorites' : 'series-favorites'
      const note = item.note?.trim() || null

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}/${item.id}/note`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ note }),
        })

        item.note = note || ''
        item.isEditing = false
      } catch (error) {
        console.error(`Fehler beim Speichern der Notiz für ${type}:`, error)
      }
    },

    async fetchCategories() {
      if (!this.isLoggedIn) return

      try {
        const response = await fetch('/api/favoritesCategories', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        this.categories = await response.json()
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error)
        this.categories = []
      }
    },

    async addCategory() {
      if (!this.newCategoryName.trim()) return

      try {
        const response = await fetch('/api/favoritesCategories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ name: this.newCategoryName }),
        })

        if (!response.ok) {
          console.error('Fehler beim Erstellen der Kategorie:', await response.text())
          return
        }

        this.newCategoryName = ''
        await this.fetchCategories()
      } catch (error) {
        console.error('Fehler beim Erstellen der Kategorie:', error)
      }
    },

    async deleteCategory(categoryId) {
      try {
        await fetch(`/api/favoritesCategories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        await this.fetchCategories()
      } catch (error) {
        console.error('Fehler beim Löschen der Kategorie:', error)
      }
    },

    async assignToCategory(favId, categoryId, type = 'movie') {
      if (!categoryId) return

      try {
        await fetch(`/api/favoritesCategories/${categoryId}/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ entryId: favId, type }),
        })
        await this.fetchFavorites()
      } catch (error) {
        console.error('Fehler beim Zuweisen zur Kategorie:', error)
      }
    },

    onDragStart(item, type) {
      this.draggedMovie = { ...item, type }
    },

    async onDragEnd() {
      if (!this.draggedMovie) return

      const targetFolderId = this.currentFolder ? this.currentFolder.id : null
      const endpoint = this.draggedMovie.type === 'movie' ? 'favorites' : 'series-favorites'

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}/${this.draggedMovie.id}/folder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ folderId: targetFolderId }),
        })

        await this.fetchFavorites()
      } catch (error) {
        console.error(`Fehler beim Verschieben des Elements:`, error)
      } finally {
        this.draggedMovie = null
      }
    },

    async deleteFavorite(item, type) {
      const endpoint = type === 'movie' ? 'favorites' : 'series-favorites'

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}/${item.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        await this.fetchFavorites()
      } catch (error) {
        console.error('Fehler beim Löschen des Favoriten:', error)
      }
    },

    extractGenres() {
      const allGenres = [
        ...new Set([
          ...this.favorites.flatMap((item) => (item.genre ? item.genre.split(', ') : [])),
          ...this.seriesFavorites.flatMap((item) => (item.genre ? item.genre.split(', ') : [])),
        ]),
      ]

      this.genres = allGenres.filter(Boolean).sort((a, b) => a.localeCompare(b, 'de'))
    },
  },
  mounted() {
    if (this.isLoggedIn) {
      this.fetchFavorites()
      this.fetchCategories()
    }
  },
}
</script>

<style scoped>
.favorites-page {
  width: min(100% - 16px, 1320px);
  margin: 0 auto;
  padding: 0.5rem 0 3rem;
  display: grid;
  gap: 1rem;
}

.auth-gate {
  min-height: 70vh;
  display: grid;
  place-items: center;
}

.auth-gate__card {
  width: min(100%, 560px);
  padding: 2rem;
  border-radius: 1.5rem;
  text-align: center;
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%);
  box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.auth-gate__icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  border-radius: 1.2rem;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  color: white;
  background: rgba(255, 255, 255, 0.08);
}

.auth-gate__eyebrow,
.section-kicker,
.favorites-hero__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent);
  font-weight: 800;
}

.auth-gate__title,
.favorites-hero__title {
  margin: 0;
  line-height: 0.96;
  letter-spacing: -0.05em;
  color: var(--foreground);
}

.auth-gate__title {
  font-size: clamp(1.8rem, 5vw, 3.2rem);
}

.auth-gate__text,
.favorites-hero__subtitle,
.inline-empty,
.empty-state p {
  color: var(--muted-foreground);
  line-height: 1.6;
}

.auth-gate__actions {
  margin-top: 1.2rem;
}

.primary-action,
.primary-button,
.danger-button,
.icon-button {
  min-height: 2.75rem;
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.primary-action,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  background: var(--primary);
  color: var(--primary-foreground);
  text-decoration: none;
}

.danger-button {
  padding: 0 1rem;
  background: rgba(180, 32, 32, 0.18);
  color: #ffd7d7;
  border: 1px solid rgba(255, 120, 120, 0.16);
}

.icon-button {
  width: 2.5rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--foreground);
}

.panel,
.favorite-card,
.stat-card {
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.94) 0%, rgba(8, 14, 28, 0.98) 100%);
  box-shadow:
      0 16px 36px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.favorites-hero {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.5rem;
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%);
}

.favorites-hero__title {
  font-size: clamp(1.9rem, 5vw, 4rem);
}

.favorites-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.stat-card {
  padding: 1rem;
  border-radius: 1.2rem;
  display: grid;
  gap: 0.35rem;
}

.stat-card__label {
  color: var(--muted-foreground);
  font-size: 0.8rem;
}

.stat-card__value {
  font-size: 1.5rem;
  color: var(--foreground);
}

.panel {
  padding: 1rem;
  border-radius: 1.4rem;
}

.search-filter--inline {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(180px, 0.7fr) minmax(180px, 0.7fr);
  gap: 0.75rem;
  align-items: center;
}

.filter-field {
  min-width: 0;
}

.filter-field--search {
  min-width: 0;
}

.category-create {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.toolbar-input,
.toolbar-select {
  width: 100%;
  min-height: 3rem;
  padding: 0 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--foreground);
  font: inherit;
  outline: none;
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.toolbar-input::placeholder {
  color: var(--muted-foreground);
}

.toolbar-input:focus,
.toolbar-select:focus {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(120, 160, 255, 0.12);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-head h2,
.empty-state h2 {
  margin: 0;
  color: var(--foreground);
  letter-spacing: -0.03em;
}

.section-count {
  min-width: 2.2rem;
  min-height: 2.2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: var(--foreground);
  background: rgba(255, 255, 255, 0.06);
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.category-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-pill__link {
  min-height: 2.5rem;
  padding: 0 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  text-decoration: none;
  color: var(--foreground);
  background: rgba(255, 255, 255, 0.05);
}

.category-pill__link span {
  color: var(--muted-foreground);
}

.inline-empty {
  margin-bottom: 1rem;
}

.empty-state {
  min-height: 18rem;
  display: grid;
  place-items: center;
  text-align: center;
}

.empty-state__icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.25rem;
  margin: 0 auto 1rem;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--foreground);
}

.favorites-section {
  display: grid;
  gap: 0.9rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
  gap: 1rem;
}

.favorite-card {
  overflow: hidden;
  border-radius: 1.25rem;
}

.favorite-card__poster-wrap {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
}

.favorite-card__poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.favorite-card__overlay {
  position: absolute;
  inset: 0;
  background:
      linear-gradient(180deg, rgba(10, 18, 34, 0.46) 0%, rgba(10, 18, 34, 0.08) 28%, rgba(10, 18, 34, 0.84) 100%);
}

.favorite-card__top {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-chip {
  min-height: 1.9rem;
  padding: 0 0.7rem;
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

.favorite-card__body {
  display: grid;
  gap: 0.8rem;
  padding: 0.95rem;
}

.favorite-card__body h3 {
  margin: 0;
  color: var(--foreground);
  font-size: 1rem;
  line-height: 1.18;
  letter-spacing: -0.02em;
}

.note-box {
  min-height: 5.5rem;
  padding: 0.85rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  color: var(--muted-foreground);
  line-height: 1.55;
  cursor: text;
}

.note-box p {
  margin: 0;
}

.note-input {
  width: 100%;
  resize: vertical;
  border: none;
  outline: none;
  background: transparent;
  color: var(--foreground);
  font: inherit;
}

@media (max-width: 900px) {
  .search-filter--inline {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .favorites-stats {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .favorites-page {
    width: min(100% - 24px, 1320px);
    gap: 1.15rem;
  }

  .favorites-hero {
    grid-template-columns: 1fr auto;
    align-items: end;
    padding: 1.15rem;
  }
}
</style>