<template>
  <div class="series-overview">
    <h1>Serien Übersicht</h1>

    <!-- Navigation zu verschiedenen Seiten -->
    <div class="navigation-links">
      <router-link to="/">Filme</router-link>
      <router-link to="/series">Serien</router-link>

      <router-link to="/favorites">Meine Favoriten</router-link>
      <router-link to="/ranking">Rangliste</router-link>
      <router-link to="/series">Serien</router-link>
    </div>

    <!-- Suchfunktion -->
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Serien durchsuchen"
        @input="searchSeries"
        class="search-input"
    />

    <!-- Kategorien-Dropdown-Menü -->
    <div class="dropdown">
      <button class="dropbtn">Kategorien</button>
      <div class="dropdown-content">
        <button v-for="genre in genres" :key="genre.id" @click="filterByCategory(genre.id)">
          {{ genre.name }}
        </button>
      </div>
    </div>

    <!-- Sortieroptionen -->
    <div class="sort-options">
      <label for="sort">Sortieren nach:</label>
      <select v-model="sortOption" @change="fetchSeries">
        <option value="">Standard</option>
        <option value="first_air_date">Ersterscheinungsdatum</option>
        <option value="vote_count">Stimmenanzahl</option>
        <option value="name">Alphabetisch</option>
      </select>
      <button @click="toggleSortOrder">
        {{ sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend' }}
      </button>
    </div>

    <!-- Serien im Raster anzeigen -->
    <div class="series-grid">
      <div v-for="series in seriesList" :key="series.id" class="series-card">
        <router-link :to="{ name: 'series-detail', params: { id: series.id }}">
          <img :src="getSeriesPoster(series.poster_path)" alt="Series Poster">
          <h2>{{ series.name }}</h2>
        </router-link>
      </div>
    </div>

    <!-- Paginierung -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page <= 1">Zurück</button>
      <span>Seite {{ page }}</span>
      <button @click="nextPage">Weiter</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      seriesList: [],
      genres: [],
      searchQuery: '',
      page: 1,
      selectedGenre: null,
      sortOption: '',
      sortOrder: 'asc',
    };
  },
  async mounted() {
    await this.fetchGenres();
    this.fetchSeries();
  },
  methods: {
    async fetchGenres() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`);
      const data = await response.json();
      this.genres = data.genres;
    },
    async fetchSeries() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&page=${this.page}`;

      if (this.selectedGenre) {
        url += `&with_genres=${this.selectedGenre}`;
      }

      if (this.sortOption) {
        url += `&sort_by=${this.sortOption}.${this.sortOrder}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      this.seriesList = data.results.filter(series => series.poster_path);
    },
    async searchSeries() {
      if (this.searchQuery) {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const response = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${this.searchQuery}&page=${this.page}`);
        const data = await response.json();
        this.seriesList = data.results.filter(series => series.poster_path);
      } else {
        this.fetchSeries();
      }
    },
    filterByCategory(genreId) {
      this.selectedGenre = genreId;
      this.page = 1;
      this.fetchSeries();
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.fetchSeries();
    },
    nextPage() {
      this.page++;
      this.fetchSeries();
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.fetchSeries();
      }
    },
    getSeriesPoster(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
  watch: {
    searchQuery() {
      this.page = 1;
      this.searchSeries();
    }
  }
};
</script>

<style scoped>
/* Styling ähnlich wie in der MovieOverview-Komponente */
.series-overview { padding: 20px; }
.series-grid { /* Grid styling */ }
/* (Add the rest of your CSS here, similar to `MovieOverview`) */
</style>
