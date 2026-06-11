<template>
  <section class="auth-container">
    <div class="auth-card">
      <h1>Login</h1>
      <p class="page-subtitle">Melde dich an, um Favoriten, Kategorien und persönliche Listen zu verwalten.</p>

      <form @submit.prevent="login">
        <input type="text" v-model="username" placeholder="Benutzername" required />
        <input type="password" v-model="password" placeholder="Passwort" required />
        <button type="submit">Einloggen</button>
      </form>

      <p>Noch keinen Account? <router-link to="/register">Registrieren</router-link></p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/login`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Login-Fehler:', response.status, response.statusText, errorData.message || errorData);
          alert(errorData.message || 'Login fehlgeschlagen.');
          return;
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', this.username);
        this.$router.push('/').then(() => window.location.reload());
      } catch (error) {
        console.error('Fehler beim Login:', error);
        alert('Serverfehler. Bitte versuchen Sie es später erneut.');
      }
    },
  },
};
</script>