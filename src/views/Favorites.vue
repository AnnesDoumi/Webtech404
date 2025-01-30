<template>
  <div class="favorites">
    <h1>Meine Favoriten</h1>

    <!-- Kategorie-Verwaltung -->
    <div class="category-management">
      <h2>Kategorien</h2>
      <div v-if="categories.length">
        <ul>
          <li v-for="category in categories" :key="category.id">
            <router-link :to="{ name: 'category-detail', params: { id: category.id }}">
              {{ category.name }} ({{ category.count }})
            </router-link>
            <button @click="deleteCategory(category.id)">🗑</button>
          </li>
        </ul>
      </div>
      <input type="text" v-model="newCategoryName" placeholder="Neue Kategorie hinzufügen">
      <button @click="addCategory">Hinzufügen</button>
    </div>
    <!-- Such- und Filterfunktion -->
    <div class="search-filter">
      <input v-model="searchQuery" placeholder="Suche nach Titel, Genre oder Notiz"/>
      <select v-model="yearFilter">
        <option value="">Erscheinungsjahr</option>
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
      <select v-model="genreFilter">
        <option value="">Genre</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
    </div>

    <!-- Favoriten anzeigen: Filme -->
    <h2>Filme</h2>
    <draggable :list="filteredMovies" itemKey="id" @end="onDragEnd" class="movie-grid">
      <template #item="{ element }">
        <div class="movie-card" draggable="true" @dragstart="onDragStart(element)">
          <img :src="element.poster" alt="Movie Poster"/>
          <h2>{{ element.title }}</h2>
          <div @dblclick="editNote(element, 'movie')">
            <p v-if="!element.isEditing">{{ element.note?.trim() ? element.note : "Notiz hinzufügen" }}</p>
            <textarea
                v-else
                v-model="element.note"
                @keyup.enter="saveNote(element, 'movie')"
                @blur="cancelEdit(element)"
                rows="2"
                ref="noteInput"
            ></textarea>
          </div>
          <!-- Dropdown zum Zuweisen einer Kategorie -->
          <select v-model="element.selectedCategory" @change="assignToCategory(element.id, element.selectedCategory)">
            <option value="">Kategorie wählen</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

          <button @click="deleteFavorite(element, 'movie')">Löschen</button>
        </div>
      </template>
    </draggable>

    <!-- Favoriten anzeigen: Serien -->
    <h2>Serien</h2>
    <draggable :list="filteredSeries" itemKey="id" @end="onDragEnd" class="movie-grid">
      <template #item="{ element }">
        <div class="movie-card" draggable="true" @dragstart="onDragStart(element)">
          <img :src="element.poster" alt="Series Poster"/>
          <h2>{{ element.title }}</h2>
          <div @dblclick="editNote(element, 'series')">
            <p v-if="!element.isEditing">{{ element.note || "Notiz hinzufügen" }}</p>
            <textarea
                v-else
                v-model="element.note"
                @keyup.enter="saveNote(element, 'series')"
                @blur="cancelEdit(element)"
                rows="2"
                ref="noteInput"
            ></textarea>
          </div>
          <button @click="deleteFavorite(element, 'series')">Löschen</button>
        </div>
      </template>
    </draggable>
  </div>

</template>

<script>
import draggable from "vuedraggable";

export default {
  components: {draggable},
  data() {
    return {
      folders: [],
      favorites: [],
      seriesFavorites: [],
      moviesInFolders: [],
      seriesInFolders: [],
      currentFolder: null,
      newFolderName: "",
      searchQuery: "",
      yearFilter: "",
      genreFilter: "",
      genres: [],
      draggedMovie: null,
      categories: [],
      newCategoryName: '',
    };
  },
  computed: {
    filteredMovies() {
      return this.filterItems(this.favorites);
    },
    filteredSeries() {
      return this.filterItems(this.seriesFavorites);
    },
    years() {
      const allYears = [
        ...new Set([...this.favorites, ...this.seriesFavorites].map((item) => item.releaseYear)),
      ];
      return allYears.sort();
    },


  },
  methods: {
    filterItems(items) {
      let filtered = items;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
            (item) =>
                item.title.toLowerCase().includes(query) ||
                (item.genre && item.genre.toLowerCase().includes(query)) ||
                (item.note && item.note.toLowerCase().includes(query))
        );
      }
      if (this.yearFilter) {
        filtered = filtered.filter((item) => item.releaseYear === this.yearFilter);
      }
      if (this.genreFilter) {
        filtered = filtered.filter((item) =>
            item.genre.toLowerCase().includes(this.genreFilter.toLowerCase())
        );
      }
      return filtered;
    },



    async fetchFavorites() {
      try {
        const folderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/folders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const movieResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const seriesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/series-favorites`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const folderData = await folderResponse.json();
        const movieData = await movieResponse.json();
        const seriesData = await seriesResponse.json();

        this.folders = folderData.folders;
        this.favorites = await Promise.all(
            movieData.map((fav) => this.fetchDetails(fav.movie_id, "movie", fav.note))
        );
        this.seriesFavorites = await Promise.all(
            seriesData.map((fav) => this.fetchDetails(fav.series_id, "tv", fav.note))
        );
        this.moviesInFolders = folderData.moviesInFolders;
        this.seriesInFolders = folderData.seriesInFolders;

        this.extractGenres();
      } catch (error) {
        console.error("Fehler beim Laden der Favoriten:", error);
      }
    }
    ,

    async fetchDetails(id, type, note) {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const response = await fetch(
            `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}`
        );
        const data = await response.json();
        return {
          id,
          title: type === "movie" ? data.title : data.name,
          poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
          releaseYear: data.release_date
              ? data.release_date.split("-")[0]
              : data.first_air_date?.split("-")[0] || "",
          genre: data.genres.map((g) => g.name).join(", "),
          note: note || "",
          isEditing: false,
        };
      } catch (error) {
        console.error("Fehler beim Abrufen der Details:", error);
      }
    },
    editNote(item, type) {
      item.isEditing = true;
    },
    async saveNote(item, type) {
      const endpoint = type === "movie" ? "favorites" : "series-favorites";
      const note = item.note?.trim() || null; // Leere Notiz in `null` umwandeln

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}/${item.id}/note`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({note: item.note}),
        });
        item.note = note || ""; // Wenn die Notiz `null` ist, setze sie auf einen leeren String

        item.isEditing = false;
      } catch (error) {
        console.error(`Fehler beim Speichern der Notiz für ${type}:`, error);
      }
    }
    ,

    async fetchCategories() {
      const response = await fetch('/api/favoritesCategories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      this.categories = await response.json();
    },
    async addCategory() {
      if (!this.newCategoryName.trim()) return;

      const response = await fetch('/api/favoritesCategories', { // STELLE SICHER, DASS DER ENDPOINT KORREKT IST!
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: this.newCategoryName })
      });

      if (!response.ok) {
        console.error('Fehler beim Erstellen der Kategorie:', await response.text());
        return;
      }

      this.newCategoryName = '';
      await this.fetchCategories();
    }
,

    
    async deleteCategory(categoryId) {
      await fetch(`/api/favoritesCategories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await this.fetchCategories();
    },
    async assignToCategory(favId, categoryId) {
      await fetch(`/api/favoritesCategories/${categoryId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ entryId: favId, type: 'movie' }),
      });
      await this.fetchFavorites();
    },

    onDragStart(item) {
      this.draggedMovie = item;
    },
    async onDragEnd(event) {
      if (!this.draggedMovie) return;
      const targetFolderId = this.currentFolder ? this.currentFolder.id : null;
      const type = this.draggedMovie.type === "movie" ? "favorites" : "series-favorites";

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${type}/${this.draggedMovie.id}/folder`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({folderId: targetFolderId}),
        });
        this.fetchFavorites();
      } catch (error) {
        console.error(`Fehler beim Verschieben des ${this.draggedMovie.type}:`, error);
      }
    },




    async deleteFavorite(item, type) {
      const endpoint = type === "movie" ? "favorites" : "series-favorites";
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        await this.fetchFavorites();
      } catch (error) {
        console.error("Fehler beim Löschen des Favoriten:", error);
      }
    },
    extractGenres() {
      const allGenres = [
        ...new Set([
          ...this.favorites.flatMap((item) => item.genre.split(", ")),
          ...this.seriesFavorites.flatMap((item) => item.genre.split(", ")),
        ]),
      ];
      this.genres = allGenres;
    },
  },
  mounted() {
    this.fetchFavorites();
    this.fetchCategories();
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
/* Responsive Anpassung */
@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

}

@media (min-width: 769px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
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

.folders {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
.folder {
  cursor: pointer;
  padding: 10px;
  background-color: #333;
  color: white;
  border-radius: 8px;
}
.folder:hover {
  background-color: #555;
}
.main-folder {
  background-color: #444;
}

</style>
