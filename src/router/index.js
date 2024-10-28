import { createRouter, createWebHistory } from 'vue-router';
import MovieOverview from '../views/MovieOverview.vue';
import MovieDetail from '../views/MovieDetail.vue';
import Impressum from '../views/Impressum.vue';
import Kontakt from '../views/Kontakt.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Favorites from '../views/Favorites.vue';
import Ranking from '../views/Ranking.vue';

const routes = [
    { path: '/', name: 'home', component: MovieOverview },
    { path: '/movies/:id', name: 'movie-detail', component: MovieDetail, props: true },
    { path: '/impressum', name: 'impressum', component: Impressum },
    { path: '/kontakt', name: 'kontakt', component: Kontakt },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/favorites', name: 'favorites', component: Favorites },
    { path: '/ranking', name: 'ranking', component: Ranking },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL || '/'), // BASE_URL oder '/' als Fallback
    routes,
});

{ path: '/:catchAll(.*)', component: NotFoundComponent }  // Für nicht definierte Routen


export default router;
