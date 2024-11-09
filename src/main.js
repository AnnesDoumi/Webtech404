import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';  // Importiere den Router

createApp(App).use(router).mount('#app');


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log('Service Worker registriert:', registration);
        })
        .catch((error) => {
            console.error('Service Worker Registrierung fehlgeschlagen:', error);
        });
}
