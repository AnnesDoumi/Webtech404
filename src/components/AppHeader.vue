<template>
  <header class="app-header">
    <router-link to="/">Home</router-link>
    <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
    <router-link v-if="!isLoggedIn" to="/register">Registrieren</router-link>
    <button v-if="isLoggedIn" @click="logout">Logout</button>
    <router-link v-if="isLoggedIn" to="/favorites">Favoriten</router-link>
  </header>
</template>

<script>
import { computed } from 'vue';

export default {
  setup() {
    const isLoggedIn = computed(() => !!localStorage.getItem('token'));

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.reload();// Zur Startseite umleiten
    };

    return {
      isLoggedIn,
      logout,
    };
  }
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
