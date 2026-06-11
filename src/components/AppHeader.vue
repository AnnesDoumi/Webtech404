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
          <router-link v-if="!isLoggedIn" to="/login" class="nav-action">Login</router-link>
          <router-link v-if="!isLoggedIn" to="/register" class="nav-action">Registrieren</router-link>
          <button v-if="isLoggedIn" class="nav-action" @click="logout">Logout</button>
        </div>

        <button class="hamburger-button nav-action" @click="toggleMobileMenu" :aria-expanded="isMobileMenuOpen">
          {{ isMobileMenuOpen ? '✕' : '☰' }}
        </button>
      </div>

      <div class="app-header__bottom" v-if="!isMobileView">
        <nav class="navigation-links" aria-label="Hauptnavigation">
          <router-link to="/">Filme</router-link>
          <router-link to="/series">Serien</router-link>
          <router-link to="/favorites">Meine Favoriten</router-link>
          <router-link to="/ranking">Rangliste</router-link>
        </nav>

        <div class="header-search">
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
            <button class="nav-action" @click="closeMobileMenu">Schließen</button>
          </div>

          <input
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
          </nav>

          <div class="mobile-menu__auth">
            <span v-if="isLoggedIn" class="user-pill">{{ username }}</span>
            <router-link v-if="!isLoggedIn" @click="closeMobileMenu" to="/login" class="nav-action">Login</router-link>
            <router-link v-if="!isLoggedIn" @click="closeMobileMenu" to="/register" class="nav-action">Registrieren</router-link>
            <button v-if="isLoggedIn" class="nav-action" @click="logout">Logout</button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isLoggedIn = ref(!!localStorage.getItem('token'));
    const username = ref(localStorage.getItem('username') || '');
    const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '');
    const isMobileMenuOpen = ref(false);
    const isMobileView = ref(window.innerWidth <= 920);

    const syncAuthState = () => {
      isLoggedIn.value = !!localStorage.getItem('token');
      username.value = localStorage.getItem('username') || '';
    };

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      syncAuthState();
      isMobileMenuOpen.value = false;
      router.push('/');
    };

    const searchPlaceholder = computed(() => {
      return route.name === 'series-overview' ? 'Serien durchsuchen' : 'Filme durchsuchen';
    });

    const updateSearchQuery = () => {
      const currentPage = route?.name || 'home';
      if (currentPage === 'series-overview') {
        router.push({ path: '/series', query: { ...route.query, search: searchQuery.value || undefined } });
      } else {
        router.push({ path: '/', query: { ...route.query, search: searchQuery.value || undefined } });
      }
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
    };

    const handleResize = () => {
      isMobileView.value = window.innerWidth <= 920;
      if (!isMobileView.value) closeMobileMenu();
    };

    watch(
        () => route.fullPath,
        () => {
          searchQuery.value = typeof route.query.search === 'string' ? route.query.search : '';
          syncAuthState();
        }
    );

    onMounted(() => {
      syncAuthState();
      window.addEventListener('resize', handleResize);
      window.addEventListener('storage', syncAuthState);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', syncAuthState);
    });

    return {
      isLoggedIn,
      username,
      searchQuery,
      isMobileMenuOpen,
      isMobileView,
      searchPlaceholder,
      logout,
      updateSearchQuery,
      toggleMobileMenu,
      closeMobileMenu,
    };
  },
};
</script>

<style scoped>
.hamburger-button {
  display: none;
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
  gap: var(--space-3);
}

.app-header__top {
  justify-content: space-between;
}

.app-header__bottom {
  justify-content: space-between;
  gap: var(--space-5);
  width: 100%;
}

.header-search {
  width: min(100%, 320px);
}

.search-input {
  width: 100%;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
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
  background: linear-gradient(180deg, #11192a 0%, #0c1321 100%);
  border-left: 1px solid var(--border);
  padding: var(--space-5);
  display: grid;
  align-content: start;
  gap: var(--space-5);
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