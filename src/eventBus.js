import { ref } from 'vue';

export const eventBus = {
    isLoggedIn: ref(!!localStorage.getItem('token')),
    setLoginStatus(status) {
        this.isLoggedIn.value = status;
    }
};
