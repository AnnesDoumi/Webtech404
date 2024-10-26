<template>
  <div class="auth-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input type="text" v-model="username" placeholder="Benutzername" required />
      <input type="password" v-model="password" placeholder="Passwort" required />
      <button type="submit">Einloggen</button>
    </form>
    <p>Noch keinen Account? <router-link to="/register">Registrieren</router-link></p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, password: this.password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        this.$router.push('/');
      } else {
        alert("Login fehlgeschlagen.");
      }
    },
  },
};
</script>

<style scoped>
.auth-container {
  padding: 20px;
  text-align: center;
}
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
