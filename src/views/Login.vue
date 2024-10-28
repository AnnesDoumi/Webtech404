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
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({username: this.username, password: this.password}),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Login-Fehler:", response.status, response.statusText, errorData.message || errorData);
          alert(errorData.message || "Login fehlgeschlagen.");
          return;
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        this.$router.push('/').then(() => window.location.reload());
      } catch (error) {
        console.error("Fehler beim Login:", error);
        alert("Serverfehler. Bitte versuchen Sie es später erneut.");
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