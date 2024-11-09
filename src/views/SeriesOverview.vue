<template>
  <div class="series-overview">
    <h1>Serien Übersicht</h1>

    <!-- Suchfunktion -->
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Serien durchsuchen"
        @input="searchSeries"
        class="search-input"
    />

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
      <div
          v-for="series in seriesList"
          :key="series.id"
          class="series-card"
          @click="navigateToDetail(series.id)"
      >
        <img :src="getSeriesPoster(series.poster_path)" alt="Series Poster">
        <h2>{{ series.name }}</h2>
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

      try {
        const response = await fetch(url);
        const data = await response.json();
        this.seriesList = data.results.filter(series => series.poster_path);
      } catch (error) {
        console.error("Fehler beim Abrufen der Serien:", error);
      }
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
      if (path) {
        return `https://image.tmdb.org/t/p/w500${path}`;
      }
      return 'https://via.placeholder.com/500x750?text=No+Poster+Available';
    },
    navigateToDetail(seriesId) {
      this.$router.push({ name: 'series-detail', params: { id: seriesId } });
    },
  },
  watch: {
    searchQuery() {
      this.searchSeries();
    },
  },
};
</script>

<style scoped>
.series-overview {
  padding: 20px;
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.series-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}

.series-card:hover {
  transform: scale(1.05);
}

.series-card img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: none;
}
</style>
