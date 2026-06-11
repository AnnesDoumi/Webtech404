<template>
  <section class="kontakt">
    <div class="page-header">
      <div>
        <h1 class="page-title">Kontakt</h1>
        <p class="page-subtitle">Fragen, Feedback oder Verbesserungsvorschläge? Schreib mir direkt über das Formular.</p>
      </div>
    </div>

    <form @submit.prevent="sendFeedback" class="panel">
      <div>
        <label for="name">Name</label>
        <input id="name" v-model="name" required />
      </div>

      <div>
        <label for="email">E-Mail</label>
        <input id="email" type="email" v-model="email" required />
      </div>

      <div>
        <label for="message">Nachricht</label>
        <textarea id="message" v-model="message" required></textarea>
      </div>

      <button type="submit">Absenden</button>
    </form>
  </section>
</template>

<script>
export default {
  name: 'KontaktView',
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
    },
  },
};
</script>