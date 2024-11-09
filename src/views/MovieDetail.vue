<template>
  <div class="movie-detail">
    <img :src="getMoviePoster(movie.backdrop_path)" alt="Backdrop" class="movie-backdrop"/>
    <div class="movie-content">
      <h1 class="movie-title">{{ movie.title }}</h1>
      <p class="movie-tagline">{{ movie.tagline }}</p>
      <p class="movie-description">{{ movie.overview }}</p>

      <div class="movie-details">
        <p><strong>Veröffentlichungsdatum:</strong> {{ movie.release_date }}</p>
        <p><strong>Bewertung:</strong> {{ movie.vote_average }} / 10 ({{ movie.vote_count }} Stimmen)</p>
        <p><strong>Originalsprache:</strong> {{ movie.original_language?.toUpperCase() || 'N/A' }}</p>

        <!-- Trailer anzeigen -->
        <div v-if="trailerUrl" class="trailer-container">
          <h3>Trailer</h3>
          <iframe
              :src="trailerUrl"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      movie: {},
      trailerUrl: '',
    };
  },
  async mounted() {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const movieId = this.$route.params.id;

    try {
      const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`);
      this.movie = await movieResponse.json();

      // Trailer-Daten abrufen
      const trailerResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`);
      const trailerData = await trailerResponse.json();
      const trailer = trailerData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      if (trailer) {
        this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      }
    } catch (error) {
      console.error("Fehler beim Laden der Filmdaten oder des Trailers:", error);
    }
  },
  methods: {
    getMoviePoster(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
};
</script>

<style scoped>
.movie-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #1e1e1e;
  color: #f5f5f5;
}

.movie-backdrop {
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.movie-content {
  max-width: 600px;
  text-align: left;
}

.trailer-container {
  margin-top: 20px;
}

iframe {
  width: 100%;
  max-width: 600px;
  height: 340px;
  border-radius: 8px;
}
</style>
