<template>
  <div class="ranking">
    <h1>Top Filme Rangliste</h1>
    <div class="movie-grid">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id }}">
          <img :src="getMoviePoster(movie.poster_path)" alt="Movie Poster" />
          <h2>{{ movie.title }}</h2>
          <p><strong>Bewertung:</strong> {{ movie.vote_average }} / 10</p>
          <p><strong>Stimmenanzahl:</strong> {{ movie.vote_count }}</p>
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
  async mounted() {
    this.fetchTopRatedMovies();
  },
  methods: {
    async fetchTopRatedMovies() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`);
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
.ranking {
  padding: 20px;
}
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.movie-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}
.movie-card:hover {
  transform: scale(1.05);
}
.movie-card img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
}
</style>
