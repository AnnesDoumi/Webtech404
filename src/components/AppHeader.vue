<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-header__top">
        <router-link to="/" class="brand" aria-label="Startseite">
          <span class="brand__mark">C</span>
          <span>CineScope</span>
        </router-link>

        <div class="header-actions desktop-auth" v-if="!isMobileView">
          <span v-if="isLoggedIn" class="user-pill">{{ username }}</span>

          <router-link v-if="!isLoggedIn" to="/login" class="nav-action">
            Login
          </router-link>

          <router-link v-if="!isLoggedIn" to="/register" class="nav-action">
            Registrieren
          </router-link>

          <button v-if="isLoggedIn" class="nav-action" @click="logout">
            Logout
          </button>
        </div>

        <button
            class="hamburger-button nav-action"
            @click="toggleMobileMenu"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Menü öffnen"
        >
          {{ isMobileMenuOpen ? '✕' : '☰' }}
        </button>
      </div>

      <div class="app-header__bottom" v-if="!isMobileView">
        <nav class="navigation-links" aria-label="Hauptnavigation">
          <router-link to="/">Filme</router-link>
          <router-link to="/series">Serien</router-link>
          <router-link to="/favorites">Meine Favoriten</router-link>
          <router-link to="/ranking">Rangliste</router-link>
          <router-link to="/kontakt">Kontakt</router-link>
          <router-link to="/impressum">Impressum</router-link>
        </nav>

        <div class="header-search" v-if="showSearch">
          <input
              type="text"
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
              @input="updateSearchQuery"
              class="search-input"
          />
        </div>
      </div>
    </div>

    <transition name="fade-slide">
      <div class="mobile-menu" v-if="isMobileMenuOpen">
        <div class="mobile-menu__inner">
          <div class="mobile-menu__top">
            <span class="brand">
              <span class="brand__mark">C</span>
              <span>Menü</span>
            </span>

            <button class="nav-action" @click="closeMobileMenu">
              Schließen
            </button>
          </div>

          <input
              v-if="showSearch"
              type="text"
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
              @input="updateSearchQuery"
              class="search-input"
          />

          <nav class="mobile-menu__nav">
            <router-link @click="closeMobileMenu" to="/">Filme</router-link>
            <router-link @click="closeMobileMenu" to="/series">Serien</router-link>
            <router-link @click="closeMobileMenu" to="/favorites">Meine Favoriten</router-link>
            <router-link @click="closeMobileMenu" to="/ranking">Rangliste</router-link>
            <router-link @click="closeMobileMenu" to="/kontakt">Kontakt</router-link>
            <router-link @click="closeMobileMenu" to="/impressum">Impressum</router-link>
          </nav>

          <div class="mobile-menu__auth">
            <span v-if="isLoggedIn" class="user-pill">{{ username }}</span>

            <router-link
                v-if="!isLoggedIn"
                @click="closeMobileMenu"
                to="/login"
                class="nav-action"
            >
              Login
            </router-link>

            <router-link
                v-if="!isLoggedIn"
                @click="closeMobileMenu"
                to="/register"
                class="nav-action"
            >
              Registrieren
            </router-link>

            <button v-if="isLoggedIn" class="nav-action" @click="logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const isLoggedIn = ref(!!localStorage.getItem('token'))
    const username = ref(localStorage.getItem('username') || '')
    const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '')
    const isMobileMenuOpen = ref(false)
    const isMobileView = ref(window.innerWidth <= 920)
    const searchDebounce = ref(null)

    const searchableRoutes = ['home', 'series-overview']

    const syncAuthState = () => {
      isLoggedIn.value = !!localStorage.getItem('token')
      username.value = localStorage.getItem('username') || ''
    }

    const showSearch = computed(() => searchableRoutes.includes(route.name))

    const searchPlaceholder = computed(() => {
      return route.name === 'series-overview'
          ? 'Serien durchsuchen'
          : 'Filme durchsuchen'
    })

    const updateSearchQuery = () => {
      clearTimeout(searchDebounce.value)

      searchDebounce.value = setTimeout(() => {
        const targetPath = route.name === 'series-overview' ? '/series' : '/'

        router.replace({
          path: targetPath,
          query: {
            ...route.query,
            search: searchQuery.value?.trim() || undefined,
          },
        })
      }, 220)
    }

    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      syncAuthState()
      isMobileMenuOpen.value = false
      router.push('/')
    }

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    const handleResize = () => {
      isMobileView.value = window.innerWidth <= 920
      if (!isMobileView.value) closeMobileMenu()
    }

    watch(
        () => route.fullPath,
        () => {
          searchQuery.value = typeof route.query.search === 'string' ? route.query.search : ''
          syncAuthState()

          if (!showSearch.value) {
            searchQuery.value = ''
          }

          closeMobileMenu()
        },
    )

    onMounted(() => {
      syncAuthState()
      window.addEventListener('resize', handleResize)
      window.addEventListener('storage', syncAuthState)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('storage', syncAuthState)
      clearTimeout(searchDebounce.value)
    })

    return {
      isLoggedIn,
      username,
      searchQuery,
      isMobileMenuOpen,
      isMobileView,
      searchPlaceholder,
      showSearch,
      logout,
      updateSearchQuery,
      toggleMobileMenu,
      closeMobileMenu,
    }
  },
}
</script>

<style scoped>
.hamburger-button {
  display: none;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 1100;
  backdrop-filter: blur(18px);
  background: color-mix(in oklab, var(--background) 82%, transparent);
  border-bottom: 1px solid var(--border);
}

.app-header__inner {
  width: min(100% - 32px, 1280px);
  margin: 0 auto;
  padding: 1rem 0;
  display: grid;
  gap: 1rem;
}

.app-header__top,
.app-header__bottom,
.header-actions,
.header-search,
.mobile-menu__top,
.mobile-menu__nav,
.mobile-menu__auth {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
}

.app-header__top {
  justify-content: space-between;
}

.app-header__bottom {
  justify-content: space-between;
  gap: 1.25rem;
  width: 100%;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--foreground);
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.brand__mark {
  width: 2.2rem;
  height: 2.2rem;
  display: inline-grid;
  place-items: center;
  border-radius: 0.8rem;
  background: linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 60%, white));
  color: var(--primary-foreground);
  box-shadow: var(--shadow-sm);
}

.navigation-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.navigation-links a,
.nav-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  text-decoration: none;
  font-weight: 600;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.navigation-links a.router-link-active {
  background: color-mix(in oklab, var(--primary) 14%, var(--card));
  border-color: color-mix(in oklab, var(--primary) 55%, var(--border));
  color: var(--primary);
}

.navigation-links a:hover,
.nav-action:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--border) 50%, var(--foreground));
}

.header-actions {
  justify-content: flex-end;
}

.header-search {
  width: min(100%, 340px);
}

.search-input {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  padding: 0 1rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--muted-foreground);
}

.user-pill {
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  color: var(--foreground);
  background: color-mix(in oklab, var(--foreground) 6%, var(--card));
  border: 1px solid var(--border);
}

.mobile-menu {
  position: fixed;
  inset: 0;
  background: rgba(6, 10, 18, 0.62);
  backdrop-filter: blur(10px);
  z-index: 1200;
  display: grid;
  justify-items: end;
}

.mobile-menu__inner {
  width: min(100%, 360px);
  min-height: 100dvh;
  background: var(--background);
  border-left: 1px solid var(--border);
  padding: 1.25rem;
  display: grid;
  align-content: start;
  gap: 1.25rem;
  box-shadow: var(--shadow-lg);
}

.mobile-menu__top {
  justify-content: space-between;
}

.mobile-menu__nav,
.mobile-menu__auth {
  flex-direction: column;
  align-items: stretch;
}

.mobile-menu__nav a,
.mobile-menu__auth .nav-action,
.mobile-menu__auth button {
  width: 100%;
  justify-content: flex-start;
  text-align: left;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}

@media (max-width: 920px) {
  .desktop-auth,
  .app-header__bottom {
    display: none;
  }

  .hamburger-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>