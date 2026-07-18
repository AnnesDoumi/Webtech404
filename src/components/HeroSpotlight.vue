<template>
  <section class="hero-spotlight">
    <div class="hero-spotlight__media">
      <img
          v-if="backdrop"
          :src="backdrop"
          alt=""
          aria-hidden="true"
          class="hero-spotlight__image"
      />
      <div class="hero-spotlight__overlay hero-spotlight__overlay--top"></div>
      <div class="hero-spotlight__overlay hero-spotlight__overlay--left"></div>
    </div>

    <div class="hero-spotlight__content">
      <div class="hero-spotlight__meta">
        <span class="hero-spotlight__pill">Spotlight</span>
        <span class="hero-spotlight__rating">
          ★ {{ item.voteAverage ? item.voteAverage.toFixed(1) : 'n/a' }}
        </span>
        <span v-if="year">{{ year }}</span>
      </div>

      <h1 class="hero-spotlight__title">{{ item.title }}</h1>
      <p v-if="item.overview" class="hero-spotlight__text">{{ item.overview }}</p>

      <router-link :to="href" class="hero-spotlight__button">
        Details ansehen
      </router-link>
    </div>
  </section>
</template>

<script>
import { tmdbImage } from '../lib/tmdb.js'

export default {
  name: 'HeroSpotlight',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    backdrop() {
      return tmdbImage(this.item.backdropPath, 'w1280')
    },
    href() {
      return this.item.mediaType === 'tv'
          ? `/series/${this.item.id}`
          : `/movies/${this.item.id}`
    },
    year() {
      return this.item.releaseDate ? this.item.releaseDate.slice(0, 4) : null
    },
  },
}
</script>

<style scoped>
.hero-spotlight {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  min-height: 22rem;
  background: var(--card);
  box-shadow: var(--shadow-md);
}

.hero-spotlight__media {
  position: absolute;
  inset: 0;
}

.hero-spotlight__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.hero-spotlight__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(8, 13, 24, 0.2) 48%, rgba(8, 13, 24, 0.9) 100%);
}

.hero-spotlight__overlay--left {
  background: linear-gradient(90deg, rgba(8, 13, 24, 0.92) 0%, rgba(8, 13, 24, 0.68) 34%, rgba(8, 13, 24, 0.18) 100%);
}

.hero-spotlight__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1rem;
  min-height: 22rem;
  padding: 1.5rem;
  max-width: 44rem;
}

.hero-spotlight__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  color: var(--muted-foreground);
  font-size: 0.875rem;
}

.hero-spotlight__pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid color-mix(in oklab, var(--primary) 40%, transparent);
  background: color-mix(in oklab, var(--primary) 14%, transparent);
  color: var(--primary);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
}

.hero-spotlight__title {
  font-family: var(--font-serif);
  font-size: clamp(2.25rem, 4vw, 4.5rem);
  line-height: 1;
  letter-spacing: -0.04em;
  margin: 0;
}

.hero-spotlight__text {
  max-width: 38rem;
  color: var(--muted-foreground);
  font-size: 0.98rem;
  line-height: 1.7;
  margin: 0;
}

.hero-spotlight__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  min-height: 2.75rem;
  padding: 0 1.25rem;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-weight: 700;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.hero-spotlight__button:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

@media (min-width: 768px) {
  .hero-spotlight__content {
    min-height: 26rem;
    padding: 2.5rem;
  }

  .hero-spotlight {
    min-height: 26rem;
  }
}
</style>