import { createRouter, createWebHistory } from 'vue-router';
import MovieOverview from '../views/MovieOverview.vue';
import MovieDetail from '../views/MovieDetail.vue';
import Impressum from '../views/Impressum.vue';
import Kontakt from '../views/Kontakt.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Favorites from '../views/Favorites.vue';
import Ranking from '../views/Ranking.vue';
import SeriesOverview from "../views/SeriesOverview.vue";

const routes = [
    { path: '/', name: 'home', component: MovieOverview },
    { path: '/movies/:id', name: 'movie-detail', component: MovieDetail, props: true },
    { path: '/impressum', name: 'impressum', component: Impressum },
    { path: '/kontakt', name: 'kontakt', component: Kontakt },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/favorites', name: 'favorites', component: Favorites },
    { path: '/ranking', name: 'ranking', component: Ranking },
    {path: '/series', name :'series-overview', component: SeriesOverview},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

