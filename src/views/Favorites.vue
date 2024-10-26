<template>
  <div class="favorites">
    <h1>Meine Favoriten</h1>
    <ul>
      <li v-for="movie in favoriteMovies" :key="movie.id">
        <span>{{ movie.title }}</span>
        <button @click="removeFavorite(movie.id)">Aus Favoriten entfernen</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Favorites",
  data() {
    return {
      favoriteMovies: [],
    };
  },
  mounted() {
    this.fetchFavorites();
  },
  methods: {
    async fetchFavorites() {
      const response = await fetch('/api/user/favorites');
      const data = await response.json();
      this.favoriteMovies = data;
    },
    removeFavorite(id) {
      fetch(`/api/user/favorites/${id}`, { method: 'DELETE' })
          .then(() => this.fetchFavorites());
    },
  },
};
</script>

<style scoped>
.favorites {
  padding: 20px;
}
button {
  margin-left: 10px;
}
</style>
