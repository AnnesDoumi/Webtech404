<template>
  <div class="series-detail">
    <img :src="getSeriesPoster(series.backdrop_path)" alt="Backdrop" class="series-backdrop"/>
    <div class="series-content">
      <h1 class="series-title">{{ series.name }}</h1>
      <p class="series-tagline">{{ series.tagline }}</p>
      <p class="series-description">{{ series.overview }}</p>

      <div class="series-details">
        <p><strong>Ersterscheinungsdatum:</strong> {{ series.first_air_date }}</p>
        <p><strong>Anzahl der Staffeln:</strong> {{ series.number_of_seasons }}</p>
        <p><strong>Anzahl der Episoden:</strong> {{ series.number_of_episodes }}</p>
        <p><strong>Bewertung:</strong> {{ series.vote_average }} / 10 ({{ series.vote_count }} Stimmen)</p>

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
        <p v-else>Kein Trailer verfügbar</p>

        <!-- Button zum Hinzufügen zu Favoriten -->
        <button class="favorite-button" @click="addFavorite">Zu Favoriten hinzufügen</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
      // Serieninformationen abrufen
      const seriesResponse = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`);
      this.series = await seriesResponse.json();

      // Trailer-Daten abrufen
      await this.fetchTrailer(seriesId);
    } catch (error) {
      console.error("Fehler beim Laden der Serieninformationen oder des Trailers:", error);
    }
  },
  methods: {
    getSeriesPoster(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    async fetchTrailer(seriesId) {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const trailerResponse = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/videos?api_key=${apiKey}`);
        const trailerData = await trailerResponse.json();

        // Nach einem YouTube-Trailer suchen
        const trailer = trailerData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
          this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        }
      } catch (error) {
        console.error("Fehler beim Abrufen des Trailers:", error);
      }
    },
    async addFavorite() {
      if (!this.isLoggedIn) {
        alert("Bitte einloggen, um Serien zu favorisieren.");
        return;
      }

      try {
        const seriesId = this.series.id;
        console.log("Series ID:", seriesId);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/series-favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            series_id: seriesId,
            note: '',
            folder_id: null,
          }),
        });

        if (response.ok) {
          alert("Serie wurde zu den Favoriten hinzugefügt");
        } else {
          const errorData = await response.json();
          console.error("Fehler beim Hinzufügen der Serien-Favoriten:", errorData.message);
          alert(errorData.message || "Fehler beim Hinzufügen zu den Serien-Favoriten.");
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Serien-Favoriten:", error);
        alert("Serverfehler. Bitte versuchen Sie es später erneut.");
      }
    }
    ,
  }
};
</script>

<style scoped>
.series-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #1e1e1e;
  color: #f5f5f5;
}

.series-backdrop {
  width: 80%;
  max-width: 600px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.series-content {
  max-width: 600px;
  text-align: center;
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

.favorite-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #646cff;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.favorite-button:hover {
  background-color: #535bf2;
}
</style>
