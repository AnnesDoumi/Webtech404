<template>
  <div class="movie-detail">
    <h1 class="movie-title">{{ movie.title }}</h1>
    <img :src="getMoviePoster(movie.poster_path)" alt="Movie Poster" />
    <p class="movie-description">{{ movie.overview }}</p>
    <button @click="addFavorite">Zu Favoriten hinzufügen</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      movie: {},
      isLoggedIn: !!localStorage.getItem('token'),
    };
  },
  async mounted() {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const response = await fetch(`https://api.themoviedb.org/3/movie/${this.$route.params.id}?api_key=${apiKey}`);
    this.movie = await response.json();
  },
  methods: {
    getMoviePoster(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    async addFavorite() {
      if (!this.isLoggedIn) {
        alert("Bitte einloggen, um Filme zu favorisieren.");
        return;
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ movieId: this.movie.id, userId: JSON.parse(atob(localStorage.getItem('token').split('.')[1])).userId })
      });

      if (response.ok) {
        alert("Zu Favoriten hinzugefügt");
      } else {
        alert("Fehler beim Hinzufügen.");
      }
    },
  },
};
</script>

<style scoped>
.movie-detail {
  padding: 20px;
  color: #333; /* Ändert die Standardfarbe des Texts */
}
.movie-title {
  font-size: 2rem;
  color: #444; /* Farbe für den Titel */
}
.movie-description {
  font-size: 1rem;
  color: #666; /* Farbe für die Beschreibung */
}
button {
  margin-top: 15px;
}
</style>
