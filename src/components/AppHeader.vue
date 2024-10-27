<template>
  <header class="app-header">
    <nav class="navbar">
      <router-link to="/" class="navbar-brand">Filmdatabase</router-link>
      <ul class="navbar-links">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/favorites">Meine Favoriten</router-link></li>
        <li><router-link to="/ranking">Rangliste</router-link></li>
      </ul>
      <div class="user-info">
        <span v-if="isLoggedIn">Eingeloggt als: {{ username }}</span>
        <button v-if="isLoggedIn" @click="logout">Logout</button>
        <router-link v-else to="/login">Login</router-link>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      username: localStorage.getItem('username'),
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      this.username = null;
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.app-header {
  background-color: #141414;
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  padding :5px;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar-brand {
  font-size: 1.5rem;
  color: #ffffff;
  text-decoration: none;
  font-weight: bold;
}

.navbar-links {
  display: flex;
  gap: 20px;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.navbar-links a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

.navbar-links a:hover {
  color: #646cff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 5px 10px;
  font-size: 0.9em;
  background-color: #646cff;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #535bf2;
}
</style>
