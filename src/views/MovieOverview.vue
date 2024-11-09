<template>
  <div class="movie-overview">
    <h1>Filme Übersicht</h1>

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

      <!-- Erscheinungsjahr-Regler -->
      <div class="year-range-filter">
        <label>Erscheinungsjahr:</label>
        <input
            type="range"
            v-model="yearRange"
            :min="minYear"
            :max="maxYear"
            @input="fetchMovies"
        />
        <span>{{ minYear }} - {{ yearRange }}</span>
      </div>

      <!-- Sortieroptionen -->
      <div class="sort-options">
        <label for="sort">Sortieren nach:</label>
        <select v-model="sortOption" @change="fetchMovies">
          <option value="">Standard</option>
          <option value="release_date">Erscheinungsdatum</option>
          <option value="vote_average">Bewertung</option>
          <option value="vote_count">Stimmenanzahl</option>
        </select>
        <button @click="toggleSortOrder">
          {{ sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend' }}
        </button>
      </div>
    </div>

    <!-- Filme im Raster anzeigen -->
    <div class="movie-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id }}">
          <img :src="getMoviePoster(movie.poster_path)" alt="Movie Poster">
          <h2>{{ movie.title }}</h2>
          <p>Bewertung: {{ movie.vote_average }}</p>
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
      selectedGenre: null,
      selectedGenreName: 'Alle',
      yearRange: new Date().getFullYear(),
      minYear: 1980,
      maxYear: new Date().getFullYear(),
      sortOption: '',
      sortOrder: 'asc',
      showDropdown: false,
      page: 1,
      totalPages: 1,
      searchQuery: '',
    };
  },

  async mounted() {
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

      if (this.searchQuery) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(this.searchQuery)}&page=${this.page}`;
      } else {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${this.page}`;
        if (this.selectedGenre) {
          url += `&with_genres=${this.selectedGenre}`;
        }
        if (this.yearRange) {
          url += `&primary_release_date.lte=${this.yearRange}-12-31&primary_release_date.gte=${this.minYear}-01-01`;
        }
        if (this.sortOption) {
          url += `&sort_by=${this.sortOption}.${this.sortOrder}`;
        }
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
          const C = 6.5; // Durchschnittliche Bewertung
          const m = 1000; // Mindestanzahl von Stimmen

          // Berechne die gewichtete Bewertung
          this.movies = data.results
              .filter((movie) => movie.poster_path)
              .map((movie) => {
                const R = movie.vote_average;
                const v = movie.vote_count;
                const weightedRating = (v / (v + m)) * R + (m / (v + m)) * C;
                return { ...movie, weightedRating };
              })
              .sort((a, b) => this.sortOrder === 'asc' ? a.weightedRating - b.weightedRating : b.weightedRating - a.weightedRating);

          this.totalPages = data.total_pages || 1;
        } else {
          this.movies = [];
          this.totalPages = 1;
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Filme:', error);
        this.movies = [];
        this.totalPages = 1;
      }
    }
,

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    selectGenre(genre) {
      this.selectedGenre = genre ? genre.id : null;
      this.selectedGenreName = genre ? genre.name : 'Alle';
      this.showDropdown = false;
      this.page = 1;
      this.fetchMovies();
    },

    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.fetchMovies();
    },

    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.fetchMovies();
      }
    },

    nextPage() {
      if (this.page < this.totalPages) {
        this.page++;
        this.fetchMovies();
      }
    },

    getMoviePoster(path) {
      return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
    },
  },

  watch: {
    '$route.query.search'(newSearch) {
      if (newSearch !== this.searchQuery) {
        this.searchQuery = newSearch;
        this.page = 1;
        this.fetchMovies();
      }
    },

    // Beobachte Änderungen an yearRange und fetchMovies
    yearRange() {
      this.page = 1;
      this.fetchMovies();
    },

    // Beobachte Änderungen an sortOption und sortOrder
    sortOption() {
      this.page = 1;
      this.fetchMovies();
    },
    sortOrder() {
      this.page = 1;
      this.fetchMovies();
    },
  },
};
</script>


<style scoped>

.movie-overview{
  margin-top: 60px;
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

.year-range-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sort-options {
  display: flex;
  gap: 10px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>
