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
    <div class="search">
      <input
          type="text"
          placeholder="Search for movies..."
          v-model="searchTerm"
          @input="searchMovies"
      />
    </div>
  </header>
</template>

<script>
export default {
  name: "AppHeader",
  data() {
    return {
      searchTerm: "",
    };
  },
  methods: {
    searchMovies() {
      this.$router.push({ name: "search", query: { q: this.searchTerm } });
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
