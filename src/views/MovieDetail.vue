<template>
  <div class="movie-detail">
    <img :src="getMoviePoster(movie.poster_path)" alt="Movie Poster">
    <h1>{{ movie.title }}</h1>
    <p>{{ movie.overview }}</p>
  </div>
</template>

<script>
export default {
  props: ['id'],
  data() {
    return {
      movie: {},
    };
  },
  mounted() {
    this.fetchMovieDetail();
  },
  methods: {
    async fetchMovieDetail() {
      const response = await fetch(
          `https://api.themoviedb.org/3/movie/${this.id}?api_key=YOUR_API_KEY`
      );
      const data = await response.json();
      this.movie = data;
    },
    getMoviePoster(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
  },
};
</script>

<style scoped>
.movie-detail img {
  max-width: 100%;
}
</style>
