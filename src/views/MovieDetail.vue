<template>
  <section class="movie-detail">
    <div class="movie-detail__hero">
      <img
          :src="getMoviePoster(movie.backdrop_path)"
          :alt="movie.title || 'Film Backdrop'"
          class="movie-detail__backdrop"
      />
      <div class="movie-detail__hero-overlay"></div>

      <div class="movie-detail__hero-content">
        <span class="movie-detail__eyebrow">Film</span>
        <h1 class="movie-detail__title">{{ movie.title }}</h1>
        <p v-if="movie.tagline" class="movie-detail__tagline">{{ movie.tagline }}</p>

        <div class="movie-detail__chips">
          <span class="detail-chip">{{ releaseYear }}</span>
          <span class="detail-chip">⭐ {{ ratingText }}</span>
          <span class="detail-chip">{{ runtimeText }}</span>
          <span class="detail-chip">{{ languageText }}</span>
        </div>

        <p class="movie-detail__overview">
          {{ movie.overview || 'Keine Beschreibung verfügbar.' }}
        </p>

        <div class="movie-detail__actions">
          <button class="favorite-button" @click="addFavorite">
            Zu Favoriten hinzufügen
          </button>
        </div>
      </div>
    </div>

    <div class="movie-detail__content">
      <div class="detail-grid">
        <section class="detail-panel">
          <h2>Informationen</h2>
          <div class="facts-grid">
            <article class="fact-card">
              <span class="fact-label">Veröffentlichung</span>
              <strong>{{ movie.release_date || 'Unbekannt' }}</strong>
            </article>
            <article class="fact-card">
              <span class="fact-label">Bewertung</span>
              <strong>{{ ratingText }}</strong>
            </article>
            <article class="fact-card">
              <span class="fact-label">Stimmen</span>
              <strong>{{ voteCountText }}</strong>
            </article>
            <article class="fact-card">
              <span class="fact-label">Originalsprache</span>
              <strong>{{ languageText }}</strong>
            </article>
          </div>
        </section>

        <section v-if="trailerUrl" class="detail-panel">
          <div class="section-head">
            <h2>Trailer</h2>
            <span class="section-meta">YouTube</span>
          </div>

          <div class="video-frame">
            <iframe
                :src="trailerUrl"
                title="Film Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
          </div>
        </section>

        <section v-if="movie.production_companies?.length" class="detail-panel">
          <div class="section-head">
            <h2>Produktionsfirmen</h2>
            <span class="section-meta">{{ movie.production_companies.length }}</span>
          </div>

          <div class="companies-grid">
            <article
                v-for="company in movie.production_companies"
                :key="company.id"
                class="company-card"
            >
              <div class="company-card__logo-wrap">
                <img
                    v-if="company.logo_path"
                    :src="getCompanyLogo(company.logo_path)"
                    :alt="company.name"
                    class="company-card__logo"
                />
                <span v-else class="company-card__fallback">{{ getInitials(company.name) }}</span>
              </div>
              <div class="company-card__body">
                <strong>{{ company.name }}</strong>
                <span v-if="company.origin_country">
                  {{ company.origin_country }}
                </span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MovieDetail',
  data() {
    return {
      movie: {
        production_companies: [],
      },
      trailerUrl: null,
      isLoggedIn: !!localStorage.getItem('token'),
    };
  },
  computed: {
    releaseYear() {
      return this.movie.release_date ? this.movie.release_date.slice(0, 4) : 'Unbekannt';
    },
    ratingText() {
      const rating = Number(this.movie.vote_average || 0);
      return `${rating.toFixed(1)} / 10`;
    },
    voteCountText() {
      return this.movie.vote_count
          ? this.movie.vote_count.toLocaleString('de-DE')
          : '0';
    },
    runtimeText() {
      if (!this.movie.runtime) return 'Laufzeit offen';
      return `${this.movie.runtime} Min`;
    },
    languageText() {
      return this.movie.original_language
          ? this.movie.original_language.toUpperCase()
          : 'N/A';
    },
  },
  async mounted() {
    await this.loadMovieData();
    await this.loadTrailer();
  },
  methods: {
    async loadMovieData() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${this.$route.params.id}?api_key=${apiKey}&language=de-DE`
        );
        this.movie = await response.json();
      } catch (error) {
        console.error('Fehler beim Laden der Filmdaten:', error);
      }
    },
    async loadTrailer() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${this.$route.params.id}/videos?api_key=${apiKey}&language=de-DE`
        );
        const data = await response.json();
        const trailer = data.results?.find(
            (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailer) {
          this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
        }
      } catch (error) {
        console.error('Fehler beim Laden des Trailers:', error);
      }
    },
    getMoviePoster(path) {
      return path
          ? `https://image.tmdb.org/t/p/w1280${path}`
          : 'https://via.placeholder.com/1280x720?text=No+Image';
    },
    getCompanyLogo(path) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    getInitials(name) {
      return name
          ? name
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0])
              .join('')
              .toUpperCase()
          : 'PF';
    },
    async addFavorite() {
      if (!this.isLoggedIn) {
        alert('Bitte einloggen, um Filme zu favorisieren.');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            movie_id: this.movie.id,
            note: '',
            folder: null,
          }),
        });

        if (response.ok) {
          alert('Film wurde zu den Favoriten hinzugefügt');
        } else {
          const errorData = await response.json();
          console.error('Fehler beim Hinzufügen des Favoriten:', errorData.message);
          alert(errorData.message || 'Fehler beim Hinzufügen zu den Favoriten.');
        }
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Favoriten:', error);
        alert('Serverfehler. Bitte versuchen Sie es später erneut.');
      }
    },
  },
};
</script>

<style scoped>
.movie-detail {
  display: grid;
  gap: 1.1rem;
  width: min(100% - 16px, 1240px);
  margin: 0 auto;
  padding: 1rem 0 2rem;
}

.movie-detail__hero {
  position: relative;
  min-height: 25rem;
  border-radius: 1.5rem;
  overflow: hidden;
  background: #0f172a;
  box-shadow: var(--shadow-lg);
}

.movie-detail__backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-detail__hero-overlay {
  position: absolute;
  inset: 0;
  background:
      linear-gradient(180deg, rgba(4, 7, 16, 0.1) 0%, rgba(4, 7, 16, 0.66) 52%, rgba(4, 7, 16, 0.96) 100%),
      linear-gradient(90deg, rgba(4, 7, 16, 0.9) 0%, rgba(4, 7, 16, 0.56) 42%, rgba(4, 7, 16, 0.18) 100%);
}

.movie-detail__hero-content {
  position: relative;
  z-index: 1;
  min-height: 25rem;
  display: grid;
  align-content: end;
  gap: 0.85rem;
  padding: 1rem;
  max-width: 100%;
}

.movie-detail__eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.68);
  font-weight: 700;
}

.movie-detail__title {
  margin: 0;
  max-width: 11ch;
  font-size: clamp(2rem, 8vw, 4.8rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: white;
}

.movie-detail__tagline {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.movie-detail__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-chip {
  min-height: 2rem;
  padding: 0 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.movie-detail__overview {
  margin: 0;
  max-width: 42rem;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.62;
  font-size: 0.95rem;
}

.movie-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.favorite-button {
  min-height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-weight: 700;
  cursor: pointer;
}

.movie-detail__content {
  display: grid;
}

.detail-grid {
  display: grid;
  gap: 1rem;
}

.detail-panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}

.detail-panel h2 {
  margin: 0;
  font-size: 1.05rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.section-meta {
  color: var(--muted-foreground);
  font-size: 0.82rem;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.fact-card {
  display: grid;
  gap: 0.3rem;
  padding: 0.9rem;
  border-radius: 1rem;
  background: color-mix(in oklab, var(--card) 84%, black 16%);
  border: 1px solid var(--border);
}

.fact-label {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
}

.video-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid var(--border);
  background: #0b1220;
}

.video-frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.companies-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.company-card {
  display: grid;
  grid-template-columns: 4rem 1fr;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  border-radius: 1rem;
  border: 1px solid var(--border);
  background: color-mix(in oklab, var(--card) 84%, black 16%);
}

.company-card__logo-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 0.9rem;
  background: white;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.company-card__logo {
  width: 78%;
  height: 78%;
  object-fit: contain;
}

.company-card__fallback {
  font-weight: 800;
  color: #0b1220;
}

.company-card__body {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.company-card__body strong {
  line-height: 1.25;
}

.company-card__body span {
  color: var(--muted-foreground);
  font-size: 0.88rem;
}

@media (min-width: 768px) {
  .movie-detail {
    width: min(100% - 32px, 1240px);
    gap: 1.5rem;
    padding: 1.5rem 0 3rem;
  }

  .movie-detail__hero {
    min-height: 32rem;
    border-radius: 1.75rem;
  }

  .movie-detail__hero-content {
    min-height: 32rem;
    max-width: 48rem;
    padding: 2.2rem;
    gap: 1rem;
  }

  .movie-detail__overview {
    font-size: 1rem;
    line-height: 1.72;
  }

  .detail-panel {
    padding: 1.2rem;
  }

  .companies-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1.05fr 1.2fr;
    align-items: start;
  }

  .detail-panel:first-child {
    grid-column: 1 / 2;
  }

  .detail-panel:nth-child(2),
  .detail-panel:nth-child(3) {
    grid-column: 2 / 3;
  }

  .companies-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>