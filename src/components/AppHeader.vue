<template>
  <header class="app-header">
    <router-link to="/">Home</router-link>
    <div class="navigation-links">
      <router-link to="/">Filme</router-link>
      <router-link to="/series">Serien</router-link>
      <router-link to="/favorites">Meine Favoriten</router-link>
      <router-link to="/ranking">Rangliste</router-link>
    </div>
    <!-- Kategorien Dropdown-Button -->
    <div class="dropdown">
      <button class="dropbtn" @click="toggleDropdown">{{ selectedGenreName }}</button>
      <div v-if="showDropdown" class="dropdown-content">
        <button @click="selectGenre(null)">Alle</button>
        <button v-for="genre in genres" :key="genre.id" @click="selectGenre(genre)">
          {{ genre.name }}
        </button>
      </div>
    </div>
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Filme durchsuchen"
        @input="updateSearchQuery"
        class="search-input"
    />


    <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
    <router-link v-if="!isLoggedIn" to="/register">Registrieren</router-link>
    <button v-if="isLoggedIn" @click="logout">Logout</button>
  </header>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(!!localStorage.getItem('token'));
    const searchQuery = ref(''); // Suchbegriff als Ref

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      isLoggedIn.value = false;
      router.push('/');
    };

    const updateSearchQuery = () => {
      // Leite den Suchbegriff als Query-Parameter an die aktuelle Route weiter
      router.push({
        path: '/',
        query: { search: searchQuery.value },
      });
    };

    onMounted(() => {
      window.addEventListener('storage', () => {
        isLoggedIn.value = !!localStorage.getItem('token');
      });
    });

    return {
      isLoggedIn,
      searchQuery,
      logout,
      updateSearchQuery,
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

.app-header a,
.app-header button {
  color: white;
  text-decoration: none;
  font-weight: bold;
  background: none;
  border: none;
  cursor: pointer;
}

.app-header button:hover,
.app-header a:hover {
  color: #ccc;
}

</style>
