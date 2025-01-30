<template>
  <div class="category-detail">
    <h1>{{ category.name }}</h1>

    <h2>Filme in dieser Kategorie</h2>
    <div class="movie-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <img :src="movie.poster" alt="Movie Poster"/>
        <h2>{{ movie.title }}</h2>
        <button @click="removeFromCategory(movie.id)">Entfernen</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['id'],
  data() {
    return {
      category: {},
      movies: [],
    };
  },
  async mounted() {
    await this.fetchCategoryDetails();
  },
  methods: {
    async fetchCategoryDetails() {
      try {
        const response = await fetch(`/api/favoritesCategories/${this.id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}` // Token mitgeben
          }
        });

        if (!response.ok) {
          throw new Error(`Fehler beim Abrufen der Kategorie: ${response.status}`);
        }

        const data = await response.json();
        this.category = data.category || {}; // Falls die Kategorie leer ist, setze leeres Objekt
        this.movies = data.movies || []; // Falls keine Filme vorhanden sind, setze leeres Array

      } catch (error) {
        console.error("Fehler beim Laden der Kategorie:", error);
      }
    }
,
    async removeFromCategory(movieId) {
      await fetch(`/api/favoritesCategories/remove/${movieId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      await this.fetchCategoryDetails();
    }
  }
};
</script>
