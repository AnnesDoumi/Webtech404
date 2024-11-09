<template>
  <div class="ranking">
    <h1>Top-Bewertete Filme</h1>

    <!-- Filter Optionen -->
    <div class="filter-options">
      <!-- Genre Dropdown -->
      <div class="dropdown-container">
        <button class="dropdown-button" @click="toggleDropdown">{{ selectedGenreName }}</button>
        <div v-if="showDropdown" class="dropdown-menu">
          <button @click="selectGenre(null)">Alle</button>
          <button v-for="genre in genres" :key="genre.id" @click="selectGenre(genre)">
            {{ genre.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filme im Raster anzeigen -->
    <div class="movie-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id }}">
          <img :src="getMoviePoster(movie.poster_path)" alt="Movie Poster">
          <h2>{{ movie.title }}</h2>
          <p>Bewertung: {{ movie.vote_average.toFixed(1) }} ⭐</p>
          <p>Stimmen: {{ movie.vote_count.toLocaleString() }}</p>
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
      movies: [],
      genres: [],
      selectedGenre: null,
      selectedGenreName: 'Alle',
      showDropdown: false,
      page: 1,
      minVotes: 5000, // Mindestanzahl der Stimmen
    };
  },
  async mounted() {
    await this.fetchGenres();
    this.fetchTopRatedMovies();
  },
  methods: {
    async fetchGenres() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
      const data = await response.json();
      this.genres = data.genres;
    },
    async fetchTopRatedMovies() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=${this.minVotes}&page=${this.page}`;

      if (this.selectedGenre) {
        url += `&with_genres=${this.selectedGenre}`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        this.movies = data.results.filter((movie) => movie.vote_count >= this.minVotes);
      } catch (error) {
        console.error("Fehler beim Abrufen der Filme:", error);
        this.movies = [];
      }
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    selectGenre(genre) {
      this.selectedGenre = genre ? genre.id : null;
      this.selectedGenreName = genre ? genre.name : 'Alle';
      this.showDropdown = false;
      this.page = 1;
      this.fetchTopRatedMovies();
    },
    nextPage() {
      this.page++;
      this.fetchTopRatedMovies();
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.fetchTopRatedMovies();
      }
    },
    getMoviePoster(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    },
  }
};
</script>

<style scoped>
.ranking {
  padding: 20px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.dropdown-container {
  position: relative;
}

.dropdown-button {
  background-color: #444;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.dropdown-menu {
  position: absolute;
  background-color: #222;
  border: 1px solid #444;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-menu button {
  background: none;
  border: none;
  color: white;
  padding: 10px;
  text-align: left;
  width: 100%;
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
