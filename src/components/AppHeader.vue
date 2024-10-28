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
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(!!localStorage.getItem('token'));

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      isLoggedIn.value = false; // Aktualisiere den Zustand auf ausgeloggt
      router.push('/'); // Leite zur Startseite um
    };

    // Überwache `localStorage` auf Änderungen des Tokens (zum Beispiel nach einem Login)
    onMounted(() => {
      window.addEventListener('storage', () => {
        isLoggedIn.value = !!localStorage.getItem('token');
      });
    });

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
