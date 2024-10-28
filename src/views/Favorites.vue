<template>
  <div class="favorites">
    <h1>Meine Favoriten</h1>

    <!-- Such- und Filterfunktion -->
    <div class="search-filter">
      <input v-model="searchQuery" placeholder="Suche nach Titel, Genre oder Notiz" />
      <select v-model="yearFilter">
        <option value="">Erscheinungsjahr</option>
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
      <select v-model="genreFilter">
        <option value="">Genre</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
    </div>

    <!-- Ordner-Erstellungsbereich -->
    <div class="folder-controls">
      <input v-model="newFolderName" placeholder="Neuer Ordnername" />
      <button @click="createFolder">Ordner erstellen</button>
    </div>

    <!-- Liste der Ordner anzeigen -->
    <div class="folders">
      <!-- "Hauptfavoriten"-Ordner -->
      <div
          class="folder main-folder"
          @drop="onFolderDrop(null)"
          @dragover.prevent
          @click="selectFolder(null)"
      >
        <h2>Hauptfavoriten</h2>
      </div>
      <div
          v-for="folder in folders"
          :key="folder.id"
          class="folder"
          @drop="onFolderDrop(folder.id)"
          @dragover.prevent
      >
        <h2 @click="selectFolder(folder.id)">{{ folder.name }}</h2>
        <button @click="deleteFolder(folder.id)">Löschen</button>
      </div>
    </div>

    <!-- Favoriten anzeigen -->
    <h2>{{ currentFolder ? "Ordner: " + currentFolder.name : "Hauptfavoriten" }}</h2>
    <draggable :list="filteredMovies" itemKey="id" @end="onDragEnd" class="movie-grid">
      <template #item="{ element }">
        <div class="movie-card" draggable="true" @dragstart="onDragStart(element)">
          <img :src="element.poster" alt="Movie Poster" />
          <h2>{{ element.title }}</h2>
          <div @dblclick="editNote(element)">
            <!-- Notiz anzeigen oder bearbeiten -->
            <p v-if="!element.isEditing">{{ element.note || "Notiz hinzufügen" }}</p>
            <textarea
                v-else
                v-model="element.note"
                @keyup.enter="saveNote(element)"
                @blur="cancelEdit(element)"
                rows="2"
                ref="noteInput"
            ></textarea>
          </div>
          <button @click="deleteFavorite(element)">Löschen</button>
        </div>
      </template>
    </draggable>
  </div>
</template>

  <script>
    import draggable from "vuedraggable";

    export default {
      components: { draggable },
      data() {
        return {
          folders: [],
          favorites: [],
          moviesInFolders: [],
          currentFolder: null,
          newFolderName: "",
          searchQuery: "",
          yearFilter: "",
          genreFilter: "", // Genre-Filter
          genres: [], // Liste der Genres
          draggedMovie: null,
        };
      },
      computed: {
        filteredMovies() {
          let movies = this.displayedMovies;
          if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            movies = movies.filter(
                (movie) =>
                    movie.title.toLowerCase().includes(query) ||
                    (movie.genre && movie.genre.toLowerCase().includes(query)) ||
                    (movie.note && movie.note.toLowerCase().includes(query)) // Suche in den Notizen
            );
          }
          if (this.yearFilter) {
            movies = movies.filter((movie) => movie.releaseYear === this.yearFilter);
          }
          if (this.genreFilter) {
            movies = movies.filter((movie) =>
                movie.genre.toLowerCase().includes(this.genreFilter.toLowerCase())
            );
          }
          return movies;
        },
        displayedMovies() {
          return this.currentFolder
              ? this.moviesInFolders.filter((movie) => movie.folder_id === this.currentFolder.id)
              : this.favorites;
        },
        years() {
          return [...new Set(this.favorites.map((movie) => movie.releaseYear))];
        },
      },
      methods: {
        async fetchFoldersAndFavorites() {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/folders`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            const data = await response.json();
            this.folders = data.folders;
            this.favorites = await Promise.all(
                data.favorites.map((fav) => this.fetchMovieDetails(fav.movie_id, fav.note))
            );
            this.moviesInFolders = await Promise.all(
                data.moviesInFolders.map((fav) =>
                    this.fetchMovieDetails(fav.movie_id, fav.note, fav.folder_id)
                )
            );
            this.extractGenres();
          } catch (error) {
            console.error("Fehler beim Laden der Ordner und Favoriten:", error);
          }
        },
        async fetchMovieDetails(movieId, note, folderId = null) {
          const apiKey = import.meta.env.VITE_TMDB_API_KEY;
          try {
            const response = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
            );
            const movieData = await response.json();
            return {
              id: movieId,
              title: movieData.title,
              poster: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
              releaseYear: movieData.release_date ? movieData.release_date.split("-")[0] : "",
              genre: movieData.genres.map((g) => g.name).join(", "),
              note: note || "",
              folder_id: folderId,
              isEditing: false,
            };
          } catch (error) {
            console.error("Fehler beim Abrufen der Filmdetails:", error);
          }
        },
        async createFolder() {
          if (!this.newFolderName) return;
          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/folders`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ name: this.newFolderName }),
            });
            const newFolder = await response.json();
            this.folders.push(newFolder);
            this.newFolderName = "";
          } catch (error) {
            console.error("Fehler beim Erstellen des Ordners:", error);
          }
        },
        editNote(movie) {
          movie.isEditing = true;
          this.$nextTick(() => {
            const noteInput = this.$refs.noteInput;
            if (noteInput) noteInput.focus();
          });
        },
        async saveNote(movie) {
          try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites/${movie.id}/note`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ note: movie.note }),
            });
            movie.isEditing = false;
          } catch (error) {
            console.error("Fehler beim Speichern der Notiz:", error);
          }
        },
        cancelEdit(movie) {
          movie.isEditing = false;
        },
        async deleteFolder(folderId) {
          try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/folders/${folderId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            this.fetchFoldersAndFavorites();
          } catch (error) {
            console.error("Fehler beim Löschen des Ordners:", error);
          }
        },
        async deleteFavorite(movie) {
          try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites/${movie.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            this.fetchFoldersAndFavorites();
          } catch (error) {
            console.error("Fehler beim Löschen des Films:", error);
          }
        },
        selectFolder(folderId) {
          this.currentFolder = folderId ? this.folders.find((folder) => folder.id === folderId) : null;
        },
        onDragStart(movie) {
          this.draggedMovie = movie;
        },
        async onDragEnd(event) {
          if (!this.draggedMovie) return;
          const targetFolderId = this.currentFolder ? this.currentFolder.id : null;
          try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites/${this.draggedMovie.id}/folder`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ folderId: targetFolderId }),
            });
            this.fetchFoldersAndFavorites();
          } catch (error) {
            console.error("Fehler beim Verschieben des Films:", error);
          }
        },
        onFolderDrop(folderId) {
          this.currentFolder = folderId ? this.folders.find((folder) => folder.id === folderId) : null;
        },
        extractGenres() {
          const allGenres = [
            ...new Set(this.favorites.flatMap((movie) => movie.genre.split(", "))),
          ];
          this.genres = allGenres;
        },
      },
      mounted() {
        this.fetchFoldersAndFavorites();
      },
    };
  </script>


  <style scoped>
.favorites {
  padding: 20px;
}
.search-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.folder-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.folders {
  display: flex;
  gap: 15px;
}
.folder {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 5px;
  background-color: #333;
  color: white;
}
.folder:hover {
  background-color: #555;
}
.main-folder {
  background-color: #444;
}
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.movie-card {
  background-color: #1a1a1a;
  color: white;
  text-align: center;
  border-radius: 8px;
  padding: 10px;
}
.movie-card img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>
