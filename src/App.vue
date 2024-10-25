<template>
  <div id="app">
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
/* Globale Stile */
body {
  margin: 0%;
  font-family: 'Roboto', sans-serif;
  background-color: #f5f5f5;
  padding: 0%;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

}

#app {

  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}


main {
  flex: 1; /* Füllt den verfügbaren Platz zwischen Header und Footer */
}
</style>
