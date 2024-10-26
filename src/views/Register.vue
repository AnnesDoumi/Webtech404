<template>
  <div class="auth-container">
    <h1>Registrieren</h1>
    <form @submit.prevent="register">
      <input type="text" v-model="username" placeholder="Benutzername" required />
      <input type="email" v-model="email" placeholder="E-Mail" required />
      <input type="password" v-model="password" placeholder="Passwort" required />
      <button type="submit">Registrieren</button>
    </form>
    <p>Bereits einen Account? <router-link to="/login">Login</router-link></p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
    };
  },
  methods: {
    async register() {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: this.username, email: this.email, password: this.password}),
      });
      if (response.ok) {
        alert("Registrierung erfolgreich.");
        this.$router.push('/login');
      } else {
        alert("Registrierung fehlgeschlagen.");
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
