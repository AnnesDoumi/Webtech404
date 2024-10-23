<template>
  <div class="movie-overview">
    <h1>Filme Übersicht</h1>
    <div class="movie-list">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id }}">
          <img :src="getMoviePoster(movie.poster_path)" alt="Movie Poster">
          <h2>{{ movie.title }}</h2>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      movies: [],
    };
  },
  mounted() {
    this.fetchMovies();
  },
  methods: {
    async fetchMovies() {
      const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=YOUR_API_KEY`
      );
      const data = await response.json();
      this.movies = data.results;
    },
    getMoviePoster(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
};
</script>

<style scoped>
.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.movie-card {
  width: 200px;
  text-align: center;
}
</style>
