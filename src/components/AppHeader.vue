<template>
  <header class="app-header">
    <nav>
      <ul>
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/movies">Filme</router-link></li>
        <li><router-link to="/impressum">Impressum</router-link></li>
        <li><router-link to="/kontakt">Kontakt</router-link></li>
      </ul>
    </nav>
    <div class="user-info">
      <span v-if="isLoggedIn">Eingeloggt als: {{ username }}</span>
      <button v-if="isLoggedIn" @click="logout">Logout</button>
      <router-link v-else to="/login">Login</router-link>
    </div>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #141414;
  padding: 10px 20px;
  color: #fff;

}
nav ul {
  display: flex;
  list-style-type: none;
  gap: 20px;
}
.search input {
  padding: 5px;
  border: none;
  border-radius: 4px;
}
</style>
