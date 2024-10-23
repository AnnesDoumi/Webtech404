<template>
  <div class="kontakt">
    <h1>Kontakt</h1>
    <form @submit.prevent="sendFeedback">
      <div>
        <label for="name">Name</label>
        <input id="name" v-model="name" required />
      </div>
      <div>
        <label for="email">Email</label>
        <input id="email" type="email" v-model="email" required />
      </div>
      <div>
        <label for="message">Nachricht</label>
        <textarea id="message" v-model="message" required></textarea>
      </div>
      <button type="submit">Absenden</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      message: '',
    };
  },
  methods: {
    sendFeedback() {
      alert('Feedback gesendet!');
      // Hier könnte später die Integration für das Verschicken der E-Mail erfolgen
    },
  },
};
</script>

<style scoped>
.kontakt form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
