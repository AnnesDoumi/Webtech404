import { createRouter, createWebHistory } from 'vue-router';
import MovieOverview from '../views/MovieOverview.vue';
import MovieDetail from '../views/MovieDetail.vue';
import Impressum from '../views/Impressum.vue';
import Kontakt from '../views/Kontakt.vue';

const routes = [
    { path: '/', name: 'home', component: MovieOverview },
    { path: '/movies/:id', name: 'movie-detail', component: MovieDetail, props: true },
    { path: '/impressum', name: 'impressum', component: Impressum },
    { path: '/kontakt', name: 'kontakt', component: Kontakt },
    { path: '/search', name: 'search', component: MovieOverview }  // Reuse overview for search
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
