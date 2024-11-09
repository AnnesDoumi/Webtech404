<template>
  <div class="movie-overview">
    <h1>Filme Übersicht</h1>

    <!-- Navigation zu verschiedenen Seiten -->

    <!-- Suchfunktion -->



    <!-- Sortieroptionen -->
    <div class="sort-options">
      <label for="sort">Sortieren nach:</label>
      <select v-model="sortOption" @change="fetchMovies">
        <option value="">Standard</option>
        <option value="release_date">Erscheinungsdatum</option>
        <option value="vote_count">Stimmenanzahl</option>
        <option value="title">Alphabetisch</option>
      </select>
      <button @click="toggleSortOrder">
        {{ sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend' }}
      </button>
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
      <span>Seite {{ page }} von {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages">Weiter</button>
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
      sortOption: '',
      sortOrder: 'asc',
    };
  },

  async mounted() {
    // Initialisiere den Suchbegriff aus der URL
    this.searchQuery = this.$route.query.search || '';
    await this.fetchGenres();
    this.fetchMovies();
  },
  methods: {
    async fetchGenres() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
        const data = await response.json();
        this.genres = data.genres;
      } catch (error) {
        console.error("Fehler beim Abrufen der Genres:", error);
      }
    },
    async fetchMovies() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      let url;

      // Unterscheide zwischen einer normalen Anfrage und einer Suchanfrage
      if (this.searchQuery) {
        // Verwende die Such-API, wenn ein Suchbegriff vorhanden ist
        url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(this.searchQuery)}&page=${this.page}`;
      } else {
        // Verwende die Discover-API, wenn kein Suchbegriff vorhanden ist
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${this.page}`;
        if (this.selectedGenre) {
          url += `&with_genres=${this.selectedGenre}`;
        }
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        // Überprüfe, ob Daten verfügbar sind
        if (data.results) {
          this.movies = data.results.filter(movie => movie.poster_path);
        } else {
          this.movies = [];
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Filme:", error);
        this.movies = [];
      }
    },


    getMoviePoster(path) {
      // Überprüfe, ob der Pfad existiert
      if (!path) {
        return 'https://via.placeholder.com/500x750?text=No+Image';
      }
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
  watch: {
    '$route.query.genre'(newGenre) {
      this.selectedGenre = newGenre || null;
      this.page = 1;
      this.fetchMovies();
    },
    '$route.query.search'(newSearch) {
      this.searchQuery = newSearch || '';
      this.page = 1;
      this.fetchMovies();
    },
  },
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

/* Sortieroptionen Styling */
.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
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
