<template>
  <section class="catalog-page catalog-page--refined">
    <div class="page-header page-header--compact">
      <div>
        <h1 class="page-title">Filme</h1>
        <p class="page-subtitle">Kompaktere Steuerung, klarere Hierarchie und dichteres Layout im Stil moderner Product-Teams.</p>
      </div>
    </div>

    <div class="toolbar-card toolbar-card--dense">
      <div class="toolbar-row toolbar-row--primary">
        <label class="field field--search">
          <span class="field-label">Suche</span>
          <input
              v-model="searchQuery"
              type="text"
              class="field-input"
              placeholder="Titel suchen"
              @input="onSearchInput"
          />
        </label>

        <label class="field field--compact">
          <span class="field-label">Genre</span>
          <select v-model="selectedGenre" class="field-input" @change="onFilterChange">
            <option :value="null">Alle Genres</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</option>
          </select>
        </label>

        <label class="field field--year">
          <span class="field-label">Von</span>
          <input v-model="startYear" type="number" min="1900" max="2030" class="field-input" @change="onFilterChange" />
        </label>

        <label class="field field--year">
          <span class="field-label">Bis</span>
          <input v-model="endYear" type="number" min="1900" max="2030" class="field-input" @change="onFilterChange" />
        </label>

        <label class="field field--compact">
          <span class="field-label">Sortierung</span>
          <select v-model="sortOption" class="field-input" @change="onFilterChange">
            <option value="">Standard</option>
            <option value="primary_release_date">Erscheinungsdatum</option>
            <option value="vote_average">Bewertung</option>
            <option value="vote_count">Stimmenanzahl</option>
          </select>
        </label>

        <button class="toolbar-chip toolbar-chip--accent" type="button" @click="toggleSortOrder">
          {{ sortOrder === 'asc' ? '↑ Asc' : '↓ Desc' }}
        </button>
      </div>

      <div class="toolbar-row toolbar-row--meta">
        <span>{{ movies.length }} Ergebnisse</span>
        <span>Seite {{ page }} von {{ totalPages }}</span>
      </div>
    </div>

    <div class="movie-grid movie-grid--refined">
      <article v-for="movie in movies" :key="movie.id" class="media-card media-card--refined">
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id } }" class="media-card__link">
          <img :src="getMoviePoster(movie.poster_path)" :alt="movie.title" class="media-card__image" />
          <div class="media-card__body">
            <h2>{{ movie.title }}</h2>
            <p>{{ movie.release_date ? movie.release_date.slice(0, 4) : '–' }}</p>
            <span class="rating-chip">★ {{ Number(movie.vote_average || 0).toFixed(1) }}</span>
          </div>
        </router-link>
      </article>
    </div>

    <nav class="pagination pagination--refined" aria-label="Filme Pagination">
      <button class="pagination-pill" @click="prevPage" :disabled="page <= 1">← Zurück</button>
      <span class="pagination-center">{{ page }} / {{ totalPages }}</span>
      <button class="pagination-pill" @click="nextPage" :disabled="page >= totalPages">Weiter →</button>
    </nav>
  </section>
</template>

<script>
export default {
  name: 'MovieOverview',
  data() {
    return {
      movies: [],
      genres: [],
      selectedGenre: null,
      startYear: 1980,
      endYear: new Date().getFullYear(),
      sortOption: '',
      sortOrder: 'desc',
      page: 1,
      totalPages: 1,
      searchQuery: this.$route.query.search || '',
      searchDebounce: null,
    };
  },
  async mounted() {
    await this.fetchGenres();
    await this.fetchMovies();
  },
  watch: {
    '$route.query.search'(newSearch) {
      this.searchQuery = newSearch || '';
      this.page = 1;
      this.fetchMovies();
    },
  },
  methods: {
    async fetchGenres() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=de-DE`);
        const data = await response.json();
        this.genres = data.genres || [];
      } catch (error) {
        console.error('Fehler beim Abrufen der Genres:', error);
      }
    },
    async fetchMovies() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let url = this.searchQuery
          ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(this.searchQuery)}&page=${this.page}&language=de-DE`
          : `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${this.page}&language=de-DE`;

      if (!this.searchQuery && this.selectedGenre) url += `&with_genres=${this.selectedGenre}`;
      if (!this.searchQuery && this.startYear && this.endYear) {
        url += `&primary_release_date.gte=${this.startYear}-01-01&primary_release_date.lte=${this.endYear}-12-31`;
      }
      if (!this.searchQuery && this.sortOption) url += `&sort_by=${this.sortOption}.${this.sortOrder}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        this.movies = (data.results || []).filter(movie => movie.poster_path);
        this.totalPages = Math.min(data.total_pages || 1, 500);
      } catch (error) {
        console.error('Fehler beim Abrufen der Filme:', error);
        this.movies = [];
        this.totalPages = 1;
      }
    },
    onSearchInput() {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.page = 1;
        this.$router.replace({ path: '/', query: { ...this.$route.query, search: this.searchQuery || undefined } });
      }, 220);
    },
    onFilterChange() {
      this.page = 1;
      this.fetchMovies();
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.page = 1;
      this.fetchMovies();
    },
    prevPage() {
      if (this.page > 1) {
        this.page -= 1;
        this.fetchMovies();
      }
    },
    nextPage() {
      if (this.page < this.totalPages) {
        this.page += 1;
        this.fetchMovies();
      }
    },
    getMoviePoster(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    },
  },
};
</script>