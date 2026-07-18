<template>
  <div class="discover-filters">
    <div class="discover-filters__row">
      <div class="discover-filters__segmented">
        <button
            v-for="m in mediaOptions"
            :key="m.value"
            type="button"
            :class="['discover-filters__segmented-btn', { 'is-active': media === m.value }]"
            @click="onMediaChange(m.value)"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="discover-filters__chips">
        <button
            v-for="c in categoryOptions"
            :key="c.value"
            type="button"
            :class="['discover-filters__chip', { 'is-active': category === c.value }]"
            @click="onCategoryChange(c.value)"
        >
          {{ c.label }}
        </button>
      </div>
    </div>

    <div v-if="genres.length" class="discover-filters__genres">
      <button
          type="button"
          :class="['discover-filters__genre', { 'is-active': genreId === undefined }]"
          @click="onGenreChange(undefined)"
      >
        Alle Genres
      </button>

      <button
          v-for="g in genres"
          :key="g.id"
          type="button"
          :class="['discover-filters__genre', { 'is-active': genreId === g.id }]"
          @click="onGenreChange(g.id)"
      >
        {{ g.name }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscoverFilters',
  props: {
    media: String,
    category: String,
    genreId: Number,
    genres: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['media-change', 'category-change', 'genre-change'],
  computed: {
    mediaOptions() {
      return [
        { value: 'movie', label: 'Filme' },
        { value: 'tv', label: 'Serien' },
      ]
    },
    categoryOptions() {
      return [
        { value: 'trending', label: 'Im Trend' },
        { value: 'popular', label: 'Beliebt' },
        { value: 'top_rated', label: 'Top bewertet' },
        { value: 'now_playing', label: 'Aktuell' },
      ]
    },
  },
  methods: {
    onMediaChange(v) {
      this.$emit('media-change', v)
    },
    onCategoryChange(v) {
      this.$emit('category-change', v)
    },
    onGenreChange(v) {
      this.$emit('genre-change', v)
    },
  },
}
</script>

<style scoped>
.discover-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.discover-filters__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.discover-filters__segmented {
  display: inline-flex;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 999px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.discover-filters__segmented-btn,
.discover-filters__chip,
.discover-filters__genre {
  min-height: 2.5rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--muted-foreground);
  padding: 0 0.9rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.discover-filters__segmented-btn.is-active,
.discover-filters__chip.is-active,
.discover-filters__genre.is-active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
}

.discover-filters__chip {
  background: transparent;
}

.discover-filters__chips,
.discover-filters__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.discover-filters__genre {
  font-size: 0.78rem;
  padding: 0 0.8rem;
  background: var(--secondary);
}

.discover-filters__genre.is-active {
  background: var(--primary);
}
</style>