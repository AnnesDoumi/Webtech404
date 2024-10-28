<template>
  <div class="favorites">
    <h1>Meine Favoriten</h1>
    <div class="movie-grid">
      <div v-for="movie in favoriteMovies" :key="movie.id" class="movie-card">
        <img :src="movie.poster" alt="Movie Poster" />
        <router-link :to="{ name: 'movie-detail', params: { id: movie.id }}">
          <h2>{{ movie.title }}</h2>
        </router-link>

        <!-- Anzeige der Notiz -->
        <div v-if="!movie.isEditing">
          <p @click="editNote(movie)">
            {{ movie.note || "Notiz hinzufügen" }}
          </p>
          <button @click="editNote(movie)">Bearbeiten</button>
        </div>

        <!-- Bearbeitungsmodus für die Notiz -->
        <div v-else>
          <textarea v-model="movie.note" rows="2"></textarea>
          <button @click="saveNote(movie)">Speichern</button>
          <button @click="cancelEdit(movie)">Abbrechen</button>
        </div>

        <button @click="removeFavorite(movie.id)">Aus Favoriten entfernen</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Favorites",
  data() {
    return {
      favoriteMovies: []
    };
  },
  mounted() {
    this.fetchFavorites();
  },
  methods: {
    async fetchFavorites() {
      try {
        const response = await fetch("http://localhost:5000/api/user/favorites", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        this.favoriteMovies = data.map((movie) => ({
          ...movie,
          isEditing: false // Zustandsvariable für den Bearbeitungsmodus
        }));
      } catch (error) {
        console.error("Fehler beim Laden der Favoriten:", error);
      }
    },
    editNote(movie) {
      movie.isEditing = true;
    },
    async saveNote(movie) {
      try {
        const response = await fetch(
            `http://localhost:5000/api/user/favorites/${movie.id}/note`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
              },
              body: JSON.stringify({note: movie.note})
            }
        );
        if (!response.ok) throw new Error("Fehler beim Speichern der Notiz.");
        movie.isEditing = false; // Wechsel zurück zur Ansicht
      } catch (error) {
        console.error(error);
      }
    },
    cancelEdit(movie) {
      movie.isEditing = false;
      this.fetchFavorites(); // Zurücksetzen der Notiz auf den Originalwert
    },
    async removeFavorite(movieId) {
      try {
        const response = await fetch(`http://localhost:5000/api/user/favorites/${movieId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (response.ok) {
          this.favoriteMovies = this.favoriteMovies.filter(
              (movie) => movie.id !== movieId
          );
        } else {
          throw new Error("Fehler beim Entfernen aus Favoriten.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style scoped>
.favorites {
  padding: 20px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.movie-card {
  background-color: #1a1a1a;
  padding: 15px;
  border-radius: 8px;
  color: white;
  text-align: center;
}

.movie-card img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #ff4d4d;
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #ff3333;
}

textarea {
  width: 100%;
  border-radius: 5px;
  margin-top: 10px;
}
</style>
