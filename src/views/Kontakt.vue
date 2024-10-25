<template>
  <div class="kontakt" style="background-color:lightblue">
    <h1 style="color:black ; margin-top: 0px" >Kontakt</h1>
    <form @submit.prevent="sendFeedback">
      <div>
        <label for="name" style="color:black">Name  </label>
        <input id="name" v-model="name" required />
      </div>
      <div>
        <label for="email" style="color:black">Email  </label>
        <input id="email" type="email" v-model="email" required />
      </div>
      <div>
        <label for="message" style="color:black">Nachricht  </label>
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

  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: lightblue;
}


</style>
