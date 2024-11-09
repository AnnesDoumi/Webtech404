<template>
  <header class="app-header">
    <router-link to="/">Home</router-link>
    <div class="navigation-links" v-if="!isMobileMenuOpen && !isMobileView">
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
    <button class="hamburger-button" @click="toggleMobileMenu">
      ☰
    </button>

    <!-- Mobile Navigation Menü -->
    <div class="mobile-menu" v-if="isMobileMenuOpen">
      <button class="hamburger-button" @click="toggleMobileMenu">
        ☰
      </button>
      <router-link @click="closeMobileMenu" to="/">Filme</router-link>
      <router-link @click="closeMobileMenu" to="/series">Serien</router-link>
      <router-link @click="closeMobileMenu" to="/favorites">Meine Favoriten</router-link>
      <router-link @click="closeMobileMenu" to="/ranking">Rangliste</router-link>

      <button @click="logout">Logout</button>
    </div>



    <div class="user-info">
      <span v-if="isLoggedIn">Willkommen &nbsp, {{ '&nbsp;'+ username + '&nbsp;&nbsp;' }}</span>
    </div>

    <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
    <router-link v-if="!isLoggedIn" to="/register">Registrieren</router-link>
    <button v-if="isLoggedIn" @click="logout">Logout</button>
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
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
    const isMobileMenuOpen = ref(false);
    const isMobileView = ref(window.innerWidth <= 768);

    // Funktion zum Logout
    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      isLoggedIn.value = false;
      router.push('/');
    };

    // Funktion zum Aktualisieren der Suchanfrage
    const updateSearchQuery = () => {
      router.push({
        path: '/',
        query: { search: searchQuery.value },
      });
    };

    // Funktion zum Umschalten des mobilen Menüs
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    // Funktion zum Schließen des mobilen Menüs
    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
    };

    // Funktion zum Umschalten des Dropdown-Menüs
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    // Funktion zur Auswahl eines Genres
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

    // Funktion zum Abrufen der Genres
    const fetchGenres = async () => {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
      const data = await response.json();
      genres.value = data.genres;
    };

    // Funktion zur Überprüfung der Fenstergröße
    const handleResize = () => {
      isMobileView.value = window.innerWidth <= 768;
      if (!isMobileView.value) {
        closeMobileMenu(); // Menü schließen, wenn zur Desktop-Ansicht gewechselt wird
      }
    };

    onMounted(() => {
      fetchGenres();
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    return {
      isLoggedIn,
      searchQuery,
      genres,
      selectedGenre,
      selectedGenreName,
      showDropdown,
      username,
      isMobileMenuOpen,
      isMobileView,
      logout,
      updateSearchQuery,
      toggleDropdown,
      selectGenre,
      toggleMobileMenu,
      closeMobileMenu,
    };
  },
};
</script>


<style>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #141414;
  color: white;
}

.navigation-links {
  display: flex;
  gap: 15px;
}

.search-input {
  flex: 1;
  margin: 0 10px;
  max-width: 200px;
}

.hamburger-menu {
  display: none;
  font-size: 24px;
  cursor: pointer;
  background: none;
  border: none;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  background-color: #1a1a1a;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .navigation-links {
    display: none;
  }

  .hamburger-menu {
    display: block;
  }
}

</style>
