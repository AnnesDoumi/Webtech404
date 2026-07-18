<template>
  <div class="media-grid">
    <MediaCard
        v-for="item in items"
        :key="`${item.mediaType}-${item.id}`"
        :item="item"
    />
  </div>
</template>

<script>
import MediaCard from './MediaCard.vue'

export default {
  name: 'MediaGrid',
  components: {
    MediaCard,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<style scoped>
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

@media (min-width: 640px) {
  .media-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.9rem;
  }
}

@media (min-width: 900px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 1200px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
  }
}
</style>