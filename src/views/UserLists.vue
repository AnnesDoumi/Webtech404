<template>
  <div class="user-lists">
    <h1>Meine Filmlisten</h1>
    <button @click="createNewList">Neue Liste erstellen</button>
    <ul>
      <li v-for="list in userLists" :key="list.id">
        <span>{{ list.name }}</span>
        <button @click="editList(list.id)">Bearbeiten</button>
        <button @click="deleteList(list.id)">Löschen</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "UserLists",
  data() {
    return {
      userLists: [],
    };
  },
  mounted() {
    this.fetchUserLists();
  },
  methods: {
    async fetchUserLists() {
      // API call to fetch user lists
      const response = await fetch('/api/user/lists');
      const data = await response.json();
      this.userLists = data;
    },
    createNewList() {
      const name = prompt("Name der neuen Liste:");
      if (name) {
        // API call to create a new list
        fetch('/api/user/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        }).then(() => this.fetchUserLists());
      }
    },
    editList(id) {
      const newName = prompt("Neuer Name für die Liste:");
      if (newName) {
        // API call to update list name
        fetch(`/api/user/lists/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        }).then(() => this.fetchUserLists());
      }
    },
    deleteList(id) {
      if (confirm("Möchtest du diese Liste wirklich löschen?")) {
        // API call to delete list
        fetch(`/api/user/lists/${id}`, { method: 'DELETE' })
            .then(() => this.fetchUserLists());
      }
    },
  },
};
</script>

<style scoped>
.user-lists {
  padding: 20px;
}
button {
  margin-left: 10px;
}
</style>
