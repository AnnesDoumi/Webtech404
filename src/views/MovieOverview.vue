<template>
  <div class="movie-overview">
    <h1>Filme Übersicht</h1>

    <!-- Navigation zu verschiedenen Seiten -->
    <div class="navigation-links">
      <router-link to="/">Filme</router-link>
      <router-link to="/favorites">Meine Favoriten</router-link>
      <router-link to="/ranking">Rangliste</router-link>
    </div>

    <!-- Suchfunktion -->
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Filme durchsuchen"
        @input="searchMovies"
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
      searchQuery: '',
      page: 1,
      selectedGenre: null,
    };
  },
  async mounted() {
    await this.fetchGenres();
    this.fetchMovies();
  },
  methods: {
    async fetchGenres() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
      const data = await response.json();
      this.genres = data.genres;
    },
    async fetchMovies() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${this.page}`;
      if (this.selectedGenre) {
        url += `&with_genres=${this.selectedGenre}`;
      }
      const response = await fetch(url);
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
    filterByCategory(genreId) {
      this.selectedGenre = genreId;
      this.page = 1;
      this.fetchMovies();
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
      this.page = 1;
      this.searchMovies();
    }
  }
};
</script>

<style scoped>
.movie-overview {
  padding: 20px;
}
.navigation-links {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}



/* Dropdown Menü Styling */
.dropdown {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}
.dropbtn {
  background-color: #1a1a1a;
  color: white;
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}
.dropdown-content button {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}
.dropdown-content button:hover {background-color: #ddd;}
.dropdown:hover .dropdown-content {
  display: block;
}
.dropdown:hover .dropbtn {
  background-color: #3e8e41;
}

/* Grid für Filme */
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

/* Pagination styling */
.pagination {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

/* Responsive Anpassung */
@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
