<template>
  <header class="app-header">
    <router-link to="/">Home</router-link>
    <div class="navigation-links">
      <router-link to="/">Filme</router-link>
      <router-link to="/series">Serien</router-link>
      <router-link to="/favorites">Meine Favoriten</router-link>
      <router-link to="/ranking">Rangliste</router-link>
    </div>
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Filme durchsuchen"
        @input="updateSearchQuery"
        class="search-input"
    />
    <div class="dropdown-container">
      <button class="dropdown-button" @click="toggleDropdown">{{ selectedGenreName }}</button>
      <div v-if="showDropdown" class="dropdown-menu">
        <button @click="selectGenre(null)">Alle</button>
        <button v-for="genre in genres" :key="genre.id" @click="selectGenre(genre)">
          {{ genre.name }}
        </button>
      </div>
    </div>

    <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
    <router-link v-if="!isLoggedIn" to="/register">Registrieren</router-link>
    <button v-if="isLoggedIn" @click="logout">Logout</button>
  </header>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isLoggedIn = ref(!!localStorage.getItem('token'));
    const searchQuery = ref('');
    const genres = ref([]);
    const selectedGenre = ref(null);
    const selectedGenreName = ref('Alle');
    const showDropdown = ref(false);
    const username = ref(localStorage.getItem('username') || '');

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      isLoggedIn.value = false;
      router.push('/');
    };

    const updateSearchQuery = () => {
      router.push({
        path: '/',
        query: { search: searchQuery.value },
      });
    };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const selectGenre = (genre) => {
      selectedGenre.value = genre ? genre.id : null;
      selectedGenreName.value = genre ? genre.name : 'Alle';
      showDropdown.value = false;

      // Dynamische Filterung basierend auf der aktuellen Seite
      const currentPage = route.name;
      if (currentPage === 'home') {
        router.push({ path: '/', query: { genre: selectedGenre.value } });
      } else if (currentPage === 'ranking') {
        router.push({ path: '/ranking', query: { genre: selectedGenre.value } });
      } else if (currentPage === 'favorites') {
        router.push({ path: '/favorites', query: { genre: selectedGenre.value } });
      } else if (currentPage === 'series-overview') {
        router.push({ path: '/series', query: { genre: selectedGenre.value } });
      }
    };

    const fetchGenres = async () => {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
      const data = await response.json();
      genres.value = data.genres;
    };

    onMounted(() => {
      fetchGenres();
    });

    return {
      isLoggedIn,
      searchQuery,
      genres,
      selectedGenre,
      selectedGenreName,
      showDropdown,
      username,
      logout,
      updateSearchQuery,
      toggleDropdown,
      selectGenre,
    };
  },
};
</script>

<style scoped>
.app-header {
  display: flex;
  gap: 15px;
  padding: 10px;
  background-color: #141414;
  color: white;
  justify-content: space-between;
  align-items: center;
}
.dropdown-container {
  position: relative;
}
.dropdown-button {
  background-color: Green;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.dropdown-menu {
  display: block;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #333;
  color: white;
  min-width: 160px;
  border-radius: 5px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
}

.user-menu {
  cursor: pointer;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #333;
  color: white;
  padding: 10px;
  border-radius: 5px;
}
</style>
