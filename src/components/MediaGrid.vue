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
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 1.1rem;
  }
}

@media (min-width: 1024px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
  }
}
</style>