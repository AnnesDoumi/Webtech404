<template>
  <section class="series-detail">
    <img :src="getSeriesPoster(series.backdrop_path)" :alt="series.name || 'Serien Backdrop'" class="series-backdrop" />

    <div class="series-content">
      <h1 class="series-title">{{ series.name }}</h1>
      <p v-if="series.tagline" class="series-tagline">{{ series.tagline }}</p>
      <p class="series-description">{{ series.overview }}</p>

      <div class="series-details panel">
        <p><strong>Ersterscheinungsdatum:</strong> {{ series.first_air_date || 'Unbekannt' }}</p>
        <p><strong>Anzahl der Staffeln:</strong> {{ series.number_of_seasons ?? 'N/A' }}</p>
        <p><strong>Anzahl der Episoden:</strong> {{ series.number_of_episodes ?? 'N/A' }}</p>
        <p><strong>Bewertung:</strong> {{ series.vote_average }} / 10 ({{ series.vote_count }} Stimmen)</p>
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
      <div v-else class="panel">
        <h3>Trailer</h3>
        <p>Kein Trailer verfügbar.</p>
      </div>

      <button class="favorite-button" @click="addFavorite">Zu Favoriten hinzufügen</button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SeriesDetail',
  data() {
    return {
      series: {},
      trailerUrl: '',
      isLoggedIn: !!localStorage.getItem('token'),
    };
  },
  async mounted() {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const seriesId = this.$route.params.id;
    try {
      const seriesResponse = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`);
      this.series = await seriesResponse.json();
      await this.fetchTrailer(seriesId);
    } catch (error) {
      console.error('Fehler beim Laden der Serieninformationen oder des Trailers:', error);
    }
  },
  methods: {
    getSeriesPoster(path) {
      return path ? `https://image.tmdb.org/t/p/w1280${path}` : 'https://via.placeholder.com/1280x720?text=No+Image';
    },
    async fetchTrailer(seriesId) {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const trailerResponse = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/videos?api_key=${apiKey}`);
        const trailerData = await trailerResponse.json();
        const trailer = trailerData.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      } catch (error) {
        console.error('Fehler beim Abrufen des Trailers:', error);
      }
    },
    async addFavorite() {
      if (!this.isLoggedIn) {
        alert('Bitte einloggen, um Serien zu favorisieren.');
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/series-favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            series_id: this.series.id,
            note: '',
            folder_id: null,
          }),
        });
        if (response.ok) {
          alert('Serie wurde zu den Favoriten hinzugefügt');
        } else {
          const errorData = await response.json();
          console.error('Fehler beim Hinzufügen der Serien-Favoriten:', errorData.message);
          alert(errorData.message || 'Fehler beim Hinzufügen zu den Serien-Favoriten.');
        }
      } catch (error) {
        console.error('Fehler beim Hinzufügen der Serien-Favoriten:', error);
        alert('Serverfehler. Bitte versuchen Sie es später erneut.');
      }
    },
  },
};
</script>