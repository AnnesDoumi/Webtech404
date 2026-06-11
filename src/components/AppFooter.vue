<template>
  <footer class="app-footer">
    <div class="app-footer__inner app-footer__custom">
      <div>
        <p class="app-footer__headline">© 2026 Filmbewertungsplattform</p>
        <p>Filme, Serien und Favoriten in einer klareren, responsiven Oberfläche.</p>
      </div>

      <nav class="app-footer__nav" aria-label="Footer Navigation">
        <router-link to="/impressum">Impressum</router-link>
        <router-link to="/kontakt">Kontakt</router-link>
      </nav>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
};
</script>

<style scoped>
.app-footer__custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-5);
}

.app-footer__headline {
  margin: 0 0 var(--space-2);
  color: var(--text);
  font-weight: 700;
}

.app-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.app-footer__nav a {
  color: var(--text-muted);
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
}

.app-footer__nav a:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 720px) {
  .app-footer__custom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>