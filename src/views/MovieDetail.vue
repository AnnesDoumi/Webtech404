<template>
  <div class="movie-detail">
    <img :src="getMoviePoster(movie.backdrop_path)" alt="Backdrop" class="movie-backdrop" />
    <div class="movie-content">
      <h1 class="movie-title">{{ movie.title }}</h1>
      <p class="movie-tagline">{{ movie.tagline }}</p>
      <p class="movie-description">{{ movie.overview }}</p>

      <!-- Zusätzliche Filmdetails -->
      <div class="movie-details">
        <p><strong>Veröffentlichungsdatum:</strong> {{ movie.release_date }}</p>
        <p><strong>Bewertung:</strong> {{ movie.vote_average }} / 10 ({{ movie.vote_count }} Stimmen)</p>
        <p><strong>Originalsprache:</strong> {{ movie.original_language ? movie.original_language.toUpperCase() : 'N/A' }}</p>

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

        <div v-if="movie.production_companies.length" class="production-companies">
          <h3>Produktionsfirmen:</h3>
          <div v-for="company in movie.production_companies" :key="company.id" class="company">
            <img v-if="company.logo_path" :src="getCompanyLogo(company.logo_path)" :alt="company.name" />
            <span>{{ company.name }}</span>
          </div>
        </div>
      </div>

      <button class="favorite-button" @click="addFavorite">Zu Favoriten hinzufügen</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      movie: {
        production_companies: []
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
        console.error("Fehler beim Laden der Filmdaten:", error);
      }
    },
    async loadTrailer() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${this.$route.params.id}/videos?api_key=${apiKey}`);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
          this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        }
      } catch (error) {
        console.error("Fehler beim Laden des Trailers:", error);
      }
    },
    getMoviePoster(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    getCompanyLogo(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    async addFavorite() {
      if (!this.isLoggedIn) {
        alert("Bitte einloggen, um Filme zu favorisieren.");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            movie_id: this.movie.id,
            note: '',
            folder: null
          })
        });

        if (response.ok) {
          alert("Film wurde zu den Favoriten hinzugefügt");
        } else {
          const errorData = await response.json();
          console.error("Fehler beim Hinzufügen des Favoriten:", errorData.message);
          alert(errorData.message || "Fehler beim Hinzufügen zu den Favoriten.");
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen des Favoriten:", error);
        alert("Serverfehler. Bitte versuchen Sie es später erneut.");
      }
    },
  },
};
</script>

<style scoped>
.movie-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1e1e1e;
  color: #f5f5f5;
  padding: 20px;
}

.movie-backdrop {
  width: 80%;
  max-width: 600px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.movie-content {
  max-width: 600px;
  text-align: center;
}

.trailer-container {
  margin-top: 20px;
  width: 100%;
}

iframe {
  width: 100%;
  max-width: 600px;
  height: 340px;
  border-radius: 8px;
}

.movie-title {
  font-size: 2rem;
  margin: 10px 0;
}

.movie-description {
  margin-bottom: 20px;
}

.movie-details {
  font-size: 1rem;
  margin-top: 20px;
}

.production-companies {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.company {
  display: flex;
  align-items: center;
  gap: 10px;
}

.company img {
  height: 30px;
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
