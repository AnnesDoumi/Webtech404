<template>
  <router-link :to="href" class="media-card">
    <div class="media-card__poster">
      <img
          v-if="poster"
          :src="poster"
          :alt="`Poster von ${item.title}`"
          loading="lazy"
          class="media-card__image"
      />
      <div v-else class="media-card__fallback">
        {{ item.mediaType === 'tv' ? 'TV' : 'Film' }}
      </div>

      <span class="media-card__badge">
        ★ {{ item.voteAverage ? item.voteAverage.toFixed(1) : 'n/a' }}
      </span>

      <span class="media-card__type">
  {{ item.rankLabel || (item.mediaType === 'tv' ? 'Serie' : 'Film') }}
</span>
    </div>

    <div class="media-card__body">
      <h3 class="media-card__title">{{ item.title }}</h3>
      <p class="media-card__year">{{ year }}</p>
    </div>
  </router-link>
</template>

<script>

import { tmdbImage } from '../lib/tmdb.js'

export default {
  name: 'MediaCard',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    href() {
      return this.item.mediaType === 'tv'
          ? `/series/${this.item.id}`
          : `/movies/${this.item.id}`
    },
    poster() {
      return tmdbImage(this.item.posterPath, 'w500')
    },
    year() {
      return this.item.releaseDate ? this.item.releaseDate.slice(0, 4) : '—'
    },
  },
}
</script>

<style scoped>
.media-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.media-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in oklab, var(--border) 55%, var(--foreground));
  box-shadow: var(--shadow-md);
}

.media-card__poster {
  position: relative;
  aspect-ratio: 2 / 3;
  background: var(--secondary);
}

.media-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-card__fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--muted-foreground);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.media-card__badge,
.media-card__type{
  position:absolute;
  top:.75rem;
  display:inline-flex;
  align-items:center;
  gap:.25rem;
  min-height:32px;
  padding:.38rem .65rem;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(7,12,20,.78);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  box-shadow:0 8px 20px rgba(0,0,0,.28);
  font-size:.76rem;
  font-weight:800;
  line-height:1;
  text-shadow:0 1px 1px rgba(0,0,0,.35);
}

.media-card__badge{
  left:.75rem;
  color:#fff;
}

.media-card__type{
  right:.75rem;
  color:#fff;
  letter-spacing:.06em;
}

.media-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.85rem 0.9rem 1rem;
}

.media-card__title {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.3;
  color: var(--foreground);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-card__year {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.85rem;
}
</style>