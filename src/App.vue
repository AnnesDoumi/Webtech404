<template>
  <div id="app" class="app-container">
    <AppHeader/>
    <main>
      <router-view/>
    </main>
    <AppFooter/>
  </div>
</template>


<script>
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
  },
};
</script>

<style>
/* Grundlegende Layoutanpassungen */
html, body, #app {
  margin-top: 10px;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: 'Roboto', sans-serif;
  background-color: #1e1e1e;
}

/* Layout für das gesamte App-Container */
#app {
  display: flex;
  flex-direction: column;
}

/* Flexibles Grid für größere Bildschirme */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

/* Flexibles Layout für Mobilgeräte */
@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 480px) {
  .movie-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Allgemeine Stile für Karten und Inhalte */
.movie-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}

.movie-card:hover {
  transform: scale(1.05);
}

.movie-card img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
}

/* Navigation Links */
.navigation-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px;
  background-color: #141414;
}

.navigation-links a {
  color: #fff;
  text-decoration: none;
  font-weight: bold;
}

.navigation-links a:hover {
  color: #ccc;
}


.app-container{
}
</style>
