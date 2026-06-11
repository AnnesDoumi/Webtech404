<template>
  <section class="auth-container">
    <div class="auth-card">
      <h1>Registrieren</h1>
      <p class="page-subtitle">Erstelle einen Account, um Favoriten zu speichern und eigene Kategorien zu verwalten.</p>

      <form @submit.prevent="register">
        <input type="text" v-model="username" placeholder="Benutzername" required />
        <input type="email" v-model="email" placeholder="E-Mail" required />
        <input type="password" v-model="password" placeholder="Passwort" required />
        <button type="submit">Registrieren</button>
      </form>

      <p>Bereits einen Account? <router-link to="/login">Login</router-link></p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      email: '',
      password: '',
    };
  },
  methods: {
    async register() {
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/register`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            email: this.email,
            password: this.password,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          alert('Registrierung erfolgreich.');
          this.$router.push('/login');
        } else {
          console.error('Registrierungsfehler:', data);
          alert(`Registrierung fehlgeschlagen: ${data.message}`);
        }
      } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
        alert('Serverfehler. Bitte versuchen Sie es später erneut.');
      }
    },
  },
};
</script>