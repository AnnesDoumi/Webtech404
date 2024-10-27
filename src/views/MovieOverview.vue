<template>
  <div class="movie-overview">
    <h1 style="color:black">Filme Übersicht</h1>
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Filme durchsuchen"
        @input="searchMovies"
        class="search-input"
    />
    <div class="movie-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id }}">
          <img :src="getMoviePoster(movie.poster_path)" alt="Movie Poster">
          <h2>{{ movie.title }}</h2>
        </router-link>
      </div>
    </div>
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
      movies: [],
      searchQuery: '',
      page: 1,
    };
  },
  async mounted() {
    this.fetchMovies();
  },
  methods: {
    async fetchMovies() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${this.page}`);
      const data = await response.json();
      this.movies = data.results;
    },
    async searchMovies() {
      if (this.searchQuery) {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${this.searchQuery}&page=${this.page}`);
        const data = await response.json();
        this.movies = data.results;
      } else {
        this.fetchMovies();
      }
    },
    nextPage() {
      this.page++;
      this.searchMovies();
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.searchMovies();
      }
    },
    getMoviePoster(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
  watch: {
    searchQuery() {
      this.page = 1; // Zurück zur ersten Seite, wenn eine neue Suche gestartet wird
      this.searchMovies();
    }
  }
};
</script>

<style scoped>
.movie-overview {
  padding: 20px;
}

.search-input {
  padding: 10px;
  width: 100%;
  margin-bottom: 20px;
  font-size: 1rem;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.movie-card {
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

.movie-card:hover {
  transform: scale(1.05);
}

.movie-card img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>
