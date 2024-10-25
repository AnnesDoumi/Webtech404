<template>
  <footer class="app-footer">
    <p>© 2024 Filmbewertungsplattform - Alle Rechte vorbehalten</p>
    <nav>
      <ul>
        <li><router-link to="/impressum">Impressum</router-link></li>
        <li><router-link to="/kontakt">Kontakt</router-link></li>
      </ul>
    </nav>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
};
</script>

<style scoped>
.app-footer {
  background-color: #141414;
  padding: 20px;
  text-align: center;
  color: #fff;

}
nav ul {
  list-style-type: none;
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>
