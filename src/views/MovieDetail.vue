<template>
  <section class="movie-detail">
    <img :src="getMoviePoster(movie.backdrop_path)" :alt="movie.title || 'Film Backdrop'" class="movie-backdrop" />

    <div class="movie-content">
      <h1 class="movie-title">{{ movie.title }}</h1>
      <p v-if="movie.tagline" class="movie-tagline">{{ movie.tagline }}</p>
      <p class="movie-description">{{ movie.overview }}</p>

      <div class="movie-details panel">
        <p><strong>Veröffentlichungsdatum:</strong> {{ movie.release_date || 'Unbekannt' }}</p>
        <p><strong>Bewertung:</strong> {{ movie.vote_average }} / 10 ({{ movie.vote_count }} Stimmen)</p>
        <p><strong>Originalsprache:</strong> {{ movie.original_language ? movie.original_language.toUpperCase() : 'N/A' }}</p>
      </div>

      <div v-if="trailerUrl" class="trailer-container panel">
        <h3>Trailer</h3>
        <iframe
            :src="trailerUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
        ></iframe>
      </div>

      <div v-if="movie.production_companies?.length" class="panel">
        <h3>Produktionsfirmen</h3>
        <div class="production-companies">
          <div v-for="company in movie.production_companies" :key="company.id" class="company">
            <img v-if="company.logo_path" :src="getCompanyLogo(company.logo_path)" :alt="company.name" />
            <span>{{ company.name }}</span>
          </div>
        </div>
      </div>

      <button class="favorite-button" @click="addFavorite">Zu Favoriten hinzufügen</button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MovieDetail',
  data() {
    return {
      movie: {
        production_companies: [],
      },
      trailerUrl: null,
      isLoggedIn: !!localStorage.getItem('token'),
    };
  },
  async mounted() {
    await this.loadMovieData();
    await this.loadTrailer();
  },
  methods: {
    async loadMovieData() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${this.$route.params.id}?api_key=${apiKey}`);
        this.movie = await response.json();
      } catch (error) {
        console.error('Fehler beim Laden der Filmdaten:', error);
      }
    },
    async loadTrailer() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${this.$route.params.id}/videos?api_key=${apiKey}`);
        const data = await response.json();
        const trailer = data.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      } catch (error) {
        console.error('Fehler beim Laden des Trailers:', error);
      }
    },
    getMoviePoster(path) {
      return path ? `https://image.tmdb.org/t/p/w1280${path}` : 'https://via.placeholder.com/1280x720?text=No+Image';
    },
    getCompanyLogo(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    async addFavorite() {
      if (!this.isLoggedIn) {
        alert('Bitte einloggen, um Filme zu favorisieren.');
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            movie_id: this.movie.id,
            note: '',
            folder: null,
          }),
        });
        if (response.ok) {
          alert('Film wurde zu den Favoriten hinzugefügt');
        } else {
          const errorData = await response.json();
          console.error('Fehler beim Hinzufügen des Favoriten:', errorData.message);
          alert(errorData.message || 'Fehler beim Hinzufügen zu den Favoriten.');
        }
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Favoriten:', error);
        alert('Serverfehler. Bitte versuchen Sie es später erneut.');
      }
    },
  },
};
</script>