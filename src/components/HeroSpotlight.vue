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
      <p v-if="item.overview" class="hero-spotlight__text">
        {{ item.overview }}
      </p>
      <router-link :to="href" class="hero-spotlight__button">
        Details ansehen
      </router-link>
    </div>
  </section>
</template>

<script>
import {tmdbImage} from '../lib/tmdb.js'

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
  border-radius: 1.4rem;
  min-height: 18.5rem;
  background: #0f172a;
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
  object-position: center top;
}

.hero-spotlight__overlay {
  position: absolute;
  inset: 0;
}

.hero-spotlight__overlay--top {
  background: linear-gradient(
      180deg,
      rgba(4, 7, 16, 0.08) 0%,
      rgba(4, 7, 16, 0.52) 50%,
      rgba(4, 7, 16, 0.92) 100%
  );
}

.hero-spotlight__overlay--left {
  background: linear-gradient(
      90deg,
      rgba(4, 7, 16, 0.9) 0%,
      rgba(4, 7, 16, 0.58) 38%,
      rgba(4, 7, 16, 0.14) 100%
  );
}

.hero-spotlight__content {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: end;
  gap: 0.75rem;
  min-height: 18.5rem;
  padding: 1rem;
  max-width: 100%;
}

.hero-spotlight__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.78rem;
}

.hero-spotlight__pill {
  display: inline-flex;
  align-items: center;
  min-height: 1.9rem;
  padding: 0 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-radius: 999px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.68rem;
}

.hero-spotlight__rating {
  display: inline-flex;
  align-items: center;
  min-height: 1.9rem;
  padding: 0 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.hero-spotlight__title {
  margin: 0;
  max-width: 11ch;
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 7vw, 4.5rem);
  line-height: 0.96;
  letter-spacing: -0.045em;
  color: white;
}

.hero-spotlight__text {
  margin: 0;
  max-width: 31rem;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.92rem;
  line-height: 1.52;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-spotlight__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  min-height: 2.6rem;
  padding: 0 1rem;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.hero-spotlight__button:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

@media (min-width: 768px) {
  .hero-spotlight {
    min-height: 26rem;
    border-radius: var(--radius-xl);
  }

  .hero-spotlight__content {
    min-height: 26rem;
    padding: 2.5rem;
    gap: 1rem;
    max-width: 44rem;
  }

  .hero-spotlight__meta {
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .hero-spotlight__pill,
  .hero-spotlight__rating {
    min-height: 2rem;
    padding: 0 0.8rem;
    margin-top: 0;
  }

  .hero-spotlight__text {
    max-width: 38rem;
    font-size: 0.98rem;
    line-height: 1.7;
    -webkit-line-clamp: 5;
  }
  .hero-spotlight__button {
    min-height: 2.75rem;
    padding: 0 1.25rem;
  }
}
</style>