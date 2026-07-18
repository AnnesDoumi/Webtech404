<template>
  <header class="app-header">
    <div class="app-header__inner">
      <router-link to="/" class="brand" aria-label="Startseite">
        <span class="brand__mark">C</span>
        <div class="brand__text">
          <span class="brand__name">CineScope</span>
          <span class="brand__meta">Movies & Series</span>
        </div>
      </router-link>

      <nav v-if="!isMobileView" class="primary-nav" aria-label="Hauptnavigation">
        <router-link to="/">Filme</router-link>
        <router-link to="/series">Serien</router-link>
        <router-link to="/favorites">Favoriten</router-link>
        <router-link to="/ranking">Rangliste</router-link>
      </nav>

      <div class="header-tools" v-if="!isMobileView">
        <div class="header-search" v-if="showSearch">
          <input
              type="text"
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
              @input="updateSearchQuery"
              class="search-input"
          />
        </div>

        <div class="auth-group">
          <span v-if="isLoggedIn" class="user-pill">{{ username }}</span>

          <router-link v-if="!isLoggedIn" to="/login" class="ghost-btn">
            Login
          </router-link>

          <router-link v-if="!isLoggedIn" to="/register" class="solid-btn">
            Registrieren
          </router-link>

          <button v-if="isLoggedIn" class="ghost-btn" @click="logout">
            Logout
          </button>
        </div>
      </div>

      <div v-if="isMobileView" class="mobile-actions">
        <button
            v-if="showSearch"
            class="icon-btn"
            type="button"
            @click="toggleMobileSearch"
            aria-label="Suche öffnen"
        >
          🔍
        </button>

        <button
            class="icon-btn"
            type="button"
            @click="toggleMobileMenu"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Menü öffnen"
        >
          {{ isMobileMenuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>

    <div v-if="isMobileView && isMobileSearchOpen && showSearch" class="mobile-search">
      <div class="mobile-search__inner">
        <input
            type="text"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            @input="updateSearchQuery"
            class="search-input"
        />
      </div>
    </div>

    <transition name="drawer-shell">
      <div
          v-if="isMobileMenuOpen"
          class="mobile-drawer"
          @click="closeAllOverlays"
      >
        <transition name="drawer-panel">
          <aside
              v-if="isMobileMenuOpen"
              class="mobile-drawer__panel"
              @click.stop
              aria-label="Mobiles Menü"
          >
            <div class="mobile-drawer__header">
              <div class="mobile-drawer__brand">
                <span class="mobile-drawer__brand-mark">C</span>
                <div class="mobile-drawer__brand-text">
                  <span class="mobile-drawer__eyebrow">Navigation</span>
                  <span class="mobile-drawer__title">CineScope</span>
                </div>
              </div>

              <button
                  type="button"
                  class="mobile-drawer__close"
                  @click="closeAllOverlays"
                  aria-label="Menü schließen"
              >
                ✕
              </button>
            </div>

            <div class="mobile-drawer__section">
              <span class="mobile-drawer__label">Navigation</span>
              <router-link @click="closeAllOverlays" to="/">Filme</router-link>
              <router-link @click="closeAllOverlays" to="/series">Serien</router-link>
              <router-link @click="closeAllOverlays" to="/favorites">Favoriten</router-link>
              <router-link @click="closeAllOverlays" to="/ranking">Rangliste</router-link>
            </div>

            <div class="mobile-drawer__section">
              <span class="mobile-drawer__label">Account</span>
              <span v-if="isLoggedIn" class="user-pill user-pill--mobile">{{ username }}</span>
              <router-link v-if="!isLoggedIn" @click="closeAllOverlays" to="/login">Login</router-link>
              <router-link v-if="!isLoggedIn" @click="closeAllOverlays" to="/register">Registrieren</router-link>
              <button v-if="isLoggedIn" class="drawer-button" @click="logout">Logout</button>
            </div>

            <div class="mobile-drawer__section mobile-drawer__section--secondary">
              <span class="mobile-drawer__label">Mehr</span>
              <router-link @click="closeAllOverlays" to="/kontakt">Kontakt</router-link>
              <router-link @click="closeAllOverlays" to="/impressum">Impressum</router-link>
            </div>
          </aside>
        </transition>
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
    const isMobileSearchOpen = ref(false)
    const isMobileView = ref(window.innerWidth <= 980)
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
      closeAllOverlays()
      router.push('/')
    }

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
      if (isMobileMenuOpen.value) {
        isMobileSearchOpen.value = false
      }
    }

    const toggleMobileSearch = () => {
      isMobileSearchOpen.value = !isMobileSearchOpen.value
      if (isMobileSearchOpen.value) {
        isMobileMenuOpen.value = false
      }
    }

    const closeAllOverlays = () => {
      isMobileMenuOpen.value = false
      isMobileSearchOpen.value = false
    }

    const handleResize = () => {
      isMobileView.value = window.innerWidth <= 980
      if (!isMobileView.value) {
        closeAllOverlays()
      }
    }

    watch(
        () => route.fullPath,
        () => {
          searchQuery.value = typeof route.query.search === 'string' ? route.query.search : ''
          syncAuthState()

          if (!showSearch.value) {
            searchQuery.value = ''
            isMobileSearchOpen.value = false
          }

          closeAllOverlays()
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
      isMobileSearchOpen,
      isMobileView,
      showSearch,
      searchPlaceholder,
      updateSearchQuery,
      logout,
      toggleMobileMenu,
      toggleMobileSearch,
      closeAllOverlays,
    }
  },
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1200;
  backdrop-filter: blur(18px);
  background: color-mix(in oklab, var(--background) 86%, transparent);
  border-bottom: 1px solid var(--border);
}


.app-header__inner {
  width: min(100% - 24px, 1240px);
  min-height: 72px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  text-decoration: none;
  color: var(--foreground);
  min-width: 0;
}

.brand__mark {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 60%, white));
  color: var(--primary-foreground);
  font-weight: 800;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.brand__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand__name {
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.brand__meta {
  color: var(--muted-foreground);
  font-size: 0.78rem;
  line-height: 1.2;
}

.primary-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 0;
}

.primary-nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0 0.85rem;
  border-radius: 999px;
  color: var(--muted-foreground);
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease;
}

.primary-nav a.router-link-active {
  background: color-mix(in oklab, var(--primary) 14%, var(--card));
  color: var(--primary);
}

.primary-nav a:hover {
  background: color-mix(in oklab, var(--foreground) 6%, transparent);
  color: var(--foreground);
}

.header-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.header-search {
  width: 260px;
}

.search-input {
  width: 100%;
  min-height: 2.65rem;
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

.auth-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  padding: 0 0.9rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--foreground) 6%, var(--card));
  border: 1px solid var(--border);
  color: var(--foreground);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ghost-btn,
.solid-btn,
.icon-btn,
.drawer-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  padding: 0 0.9rem;
  background: var(--card);
  color: var(--foreground);
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
}

.solid-btn {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
}

.mobile-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.icon-btn {
  width: 2.6rem;
  padding: 0;
}

.mobile-search {
  border-top: 1px solid var(--border);
  background: color-mix(in oklab, var(--background) 92%, transparent);
}

.mobile-search__inner {
  width: min(100% - 24px, 1240px);
  margin: 0 auto;
  padding: 0.75rem 0 1rem;
}

.mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 1500;
  background: rgba(6, 10, 18, 0.62);
  display: flex;
  justify-content: flex-end;
}


.mobile-drawer__section {
  display: grid;
  gap: 0.45rem;
}

.mobile-drawer__section--secondary {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}


.mobile-drawer__panel {
  width: min(88vw, 360px);
  height: 100dvh;
  background: linear-gradient(180deg, #0e1830 0%, #0b1220 100%);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.9rem;
  display: grid;
  gap: 1rem;
  align-content: start;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow:
      -12px 0 36px rgba(0, 0, 0, 0.28),
      -2px 0 10px rgba(0, 0, 0, 0.12);
  opacity: 1;
  backdrop-filter: none;
}

.mobile-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.1rem 0 0.4rem;
}

.mobile-drawer__brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.mobile-drawer__brand-mark {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.8rem;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, #1b3a73 0%, #284f9e 100%);
  box-shadow: 0 8px 24px rgba(34, 74, 150, 0.28);
  flex-shrink: 0;
}

.mobile-drawer__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mobile-drawer__eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1;
}

.mobile-drawer__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #f4f7ff;
  line-height: 1.1;
}

.mobile-drawer__close {
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #f4f7ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  flex-shrink: 0;
}

.mobile-drawer__section a,
.drawer-button,
.user-pill--mobile {
  min-height: 2.95rem;
  padding: 0 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #f4f7ff;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.mobile-drawer__label {
  font-size: 0.74rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.58);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.drawer-shell-enter-active,
.drawer-shell-leave-active {
  transition: opacity 220ms ease;
}

.drawer-shell-enter-from,
.drawer-shell-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(100%);
}

@media (max-width: 979px) {
  .app-header__inner {
    grid-template-columns: 1fr auto;
    min-height: 68px;
  }

  .brand__meta {
    display: none;
  }
}

@media (max-width: 560px) {
  .app-header__inner {
    width: min(100% - 16px, 1240px);
  }

  .brand__name {
    font-size: 0.98rem;
  }

  .brand__mark {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.75rem;
  }
}
</style>