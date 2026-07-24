<template>
  <section class="auth-container">
    <div class="auth-card">
      <h1>Login</h1>
      <p class="page-subtitle">
        Melde dich an, um Favoriten und persönliche Listen zu verwalten.
      </p>

      <form @submit.prevent="login" class="auth-form">
        <input
            type="text"
            v-model.trim="username"
            placeholder="Benutzername"
            required
            autocomplete="username"
        />
        <input
            type="password"
            v-model="password"
            placeholder="Passwort"
            required
            autocomplete="current-password"
        />
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Einloggen...' : 'Einloggen' }}
        </button>
      </form>

      <p class="auth-footer">
        Noch keinen Account?
        <router-link to="/register">Registrieren</router-link>
      </p>
    </div>
  </section>
</template>

<script>
const API_BASE_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
    : '/api'

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      isSubmitting: false,
    }
  },
  methods: {
    async login() {
      if (this.isSubmitting) return

      this.isSubmitting = true

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        })

        const raw = await response.text()
        let data = {}

        try {
          data = raw ? JSON.parse(raw) : {}
        } catch {
          data = { message: raw || 'Unbekannter Serverfehler.' }
        }

        if (!response.ok) {
          alert(data.message || 'Login fehlgeschlagen.')
          return
        }

        if (!data.token) {
          alert('Kein Token vom Server erhalten.')
          return
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('username', this.username)

        await this.$router.push('/')
        window.location.reload()
      } catch (error) {
        console.error('Fehler beim Login:', error)
        alert('Serverfehler. Bitte versuche es später erneut.')
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.auth-card {
  width: min(100%, 440px);
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  background: linear-gradient(180deg, rgba(10, 18, 34, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%);
  box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.auth-card h1 {
  margin: 0 0 0.5rem;
  color: var(--foreground);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.page-subtitle {
  margin: 0 0 1.5rem;
  color: var(--muted-foreground);
  line-height: 1.6;
}

.auth-form {
  display: grid;
  gap: 0.9rem;
}

.auth-form input {
  width: 100%;
  min-height: 3.2rem;
  padding: 0 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--foreground);
  font: inherit;
  outline: none;
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.auth-form input::placeholder {
  color: var(--muted-foreground);
}

.auth-form input:focus {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(120, 160, 255, 0.12);
}

.auth-form button {
  min-height: 3.2rem;
  border: none;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-foreground);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, opacity 180ms ease;
}

.auth-form button:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.auth-footer {
  margin: 1.2rem 0 0;
  color: var(--muted-foreground);
}

.auth-footer a {
  color: var(--foreground);
  font-weight: 700;
  text-decoration: none;
}
</style>