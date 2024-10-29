<template>
  <div class="movie-overview">
    <h1>Rangliste der Filme</h1>

    <!-- Navigation zu verschiedenen Seiten -->
    <div class="navigation-links">
      <router-link to="/">Filme</router-link>
      <router-link to="/favorites">Meine Favoriten</router-link>
      <router-link to="/ranking">Rangliste</router-link>
    </div>

    <!-- Kategorien-Dropdown-Menü -->
    <div class="dropdown">
      <button class="dropbtn" @click="showAllCategories">Allgemein</button>
      <div class="dropdown-content">
        <button v-for="genre in genres" :key="genre.id" @click="filterByCategory(genre.id)">
          {{ genre.name }}
        </button>
      </div>
    </div>

    <!-- Filme im Raster anzeigen -->
    <div class="movie-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id }}">
          <img :src="getMoviePoster(movie.poster_path)" alt="Movie Poster">
          <h2>{{ movie.title }}</h2>
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
      page: 1,
      selectedGenre: null,
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
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=100&page=${this.page}`;

      if (this.selectedGenre) {
        url += `&with_genres=${this.selectedGenre}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      this.movies = data.results;
    }
    ,
    filterByCategory(genreId) {
      this.selectedGenre = genreId;
      this.page = 1;
      this.fetchTopRatedMovies();
    },
    showAllCategories() {
      this.selectedGenre = null; // Clear selected genre
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
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  }
};
</script>


<style scoped>
.ranking {
  padding: 20px;
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
</style>
