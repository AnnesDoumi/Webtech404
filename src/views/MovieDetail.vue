<template>
  <section class="movie-detail">
    <div class="movie-detail__hero">
      <div class="movie-detail__hero-backdrop">
        <img
            :src="heroBackdrop"
            :alt="movie.title || 'Film Backdrop'"
            class="movie-detail__backdrop"
        />
        <div class="movie-detail__backdrop-overlay"></div>
      </div>

      <div class="movie-detail__hero-card">
        <div class="movie-detail__poster-wrap">
          <img
              :src="posterImage"
              :alt="movie.title || 'Film Poster'"
              class="movie-detail__poster"
          />
        </div>

        <div class="movie-detail__hero-copy">
          <p class="movie-detail__eyebrow">Film Detail</p>

          <h1 class="movie-detail__title">
            {{ movie.title || 'Unbekannter Film' }}
          </h1>

          <p v-if="movie.tagline" class="movie-detail__tagline">
            {{ movie.tagline }}
          </p>

          <div class="movie-detail__chips">
            <span class="detail-chip">{{ releaseYear }}</span>
            <span class="detail-chip">★ {{ ratingText }}</span>
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
    </div>

    <div class="movie-detail__grid">
      <section class="detail-showcase">
        <div
            class="detail-showcase__backdrop"
            :style="trailerBackdropStyle"
            aria-hidden="true"
        >
          <div class="detail-showcase__backdrop-blur"></div>
          <div class="detail-showcase__backdrop-fade"></div>
        </div>

        <div class="detail-showcase__inner">
          <div class="detail-showcase__media">
            <div class="section-head section-head--integrated">
              <div>
                <p class="section-kicker">Watch</p>
                <h2>Trailer & Produktionsdetails</h2>
                <p class="section-subtitle section-subtitle--overlay">
                  Der Trailer steht im Fokus, die Filmdetails bleiben bewusst dezent im Hintergrund der Komposition.
                </p>
              </div>
              <span v-if="trailerUrl" class="section-meta section-meta--pill">YouTube</span>
            </div>

            <div v-if="trailerUrl" class="video-stage">
              <div class="video-frame video-frame--showcase">
                <iframe
                    :src="trailerUrl"
                    title="Film Trailer"
                    loading="lazy"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
              </div>
            </div>

            <div v-else class="empty-box empty-box--feature">
              <p>Für diesen Film ist aktuell kein Trailer verfügbar.</p>
            </div>
          </div>

          <div class="detail-showcase__body">
            <div class="info-inline">
              <article class="info-inline__item">
                <span class="info-inline__label">Veröffentlichung</span>
                <strong class="info-inline__value">{{ movie.release_date || 'Unbekannt' }}</strong>
              </article>

              <article class="info-inline__item">
                <span class="info-inline__label">Status</span>
                <strong class="info-inline__value">{{ movie.status || 'Unbekannt' }}</strong>
              </article>

              <article class="info-inline__item">
                <span class="info-inline__label">Stimmen</span>
                <strong class="info-inline__value">{{ voteCountText }}</strong>
              </article>

              <article class="info-inline__item">
                <span class="info-inline__label">Originalsprache</span>
                <strong class="info-inline__value">{{ languageText }}</strong>
              </article>
            </div>

            <div
                v-if="movie.production_companies?.length"
                class="companies-block companies-block--integrated"
            >
              <div class="subsection-head subsection-head--soft">
                <h3>Beteiligte Firmen</h3>
                <span>{{ movie.production_companies.length }}</span>
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
                    <span v-else class="company-card__fallback">
                      {{ getInitials(company.name) }}
                    </span>
                  </div>

                  <div class="company-card__body">
                    <strong>{{ company.name }}</strong>
                    <span>{{ company.origin_country || '—' }}</span>
                  </div>
                </article>
              </div>
            </div>

            <div v-else class="empty-box empty-box--compact">
              <p>Für diesen Film sind keine Produktionsfirmen hinterlegt.</p>
            </div>
          </div>
        </div>
      </section>
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
      trailerKey: null,
      isLoggedIn: !!localStorage.getItem('token'),
    }
  },
  computed: {
    heroBackdrop() {
      return this.movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${this.movie.backdrop_path}`
          : 'https://via.placeholder.com/1280x720?text=No+Image'
    },
    posterImage() {
      return this.movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`
          : 'https://via.placeholder.com/500x750?text=No+Poster'
    },
    releaseYear() {
      return this.movie.release_date ? this.movie.release_date.slice(0, 4) : 'Unbekannt'
    },
    ratingText() {
      const rating = Number(this.movie.vote_average || 0)
      return `${rating.toFixed(1)} / 10`
    },
    voteCountText() {
      return this.movie.vote_count
          ? this.movie.vote_count.toLocaleString('de-DE')
          : '0'
    },
    runtimeText() {
      if (!this.movie.runtime) return 'Laufzeit offen'
      return `${this.movie.runtime} Min`
    },
    languageText() {
      return this.movie.original_language
          ? this.movie.original_language.toUpperCase()
          : 'N/A'
    },
    trailerThumbnail() {
      return this.trailerKey
          ? `https://img.youtube.com/vi/${this.trailerKey}/maxresdefault.jpg`
          : this.heroBackdrop
    },
    trailerBackdropStyle() {
      return {
        backgroundImage: `
          linear-gradient(180deg, rgba(6, 10, 20, 0.18) 0%, rgba(6, 10, 20, 0.72) 52%, rgba(6, 10, 20, 0.96) 100%),
          linear-gradient(90deg, rgba(6, 10, 20, 0.72) 0%, rgba(6, 10, 20, 0.28) 42%, rgba(6, 10, 20, 0.8) 100%),
          url(${this.trailerThumbnail})
        `,
      }
    },
  },
  async mounted() {
    await this.loadMovieData()
    await this.loadTrailer()
  },
  watch: {
    '$route.params.id': {
      async handler() {
        await this.loadMovieData()
        await this.loadTrailer()
      },
    },
  },
  methods: {
    async loadMovieData() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY

      try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${this.$route.params.id}?api_key=${apiKey}&language=de-DE`
        )
        this.movie = await response.json()
      } catch (error) {
        console.error('Fehler beim Laden der Filmdaten:', error)
      }
    },

    async loadTrailer() {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY

      try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${this.$route.params.id}/videos?api_key=${apiKey}&language=de-DE`
        )
        const data = await response.json()
        const trailer = data.results?.find(
            (video) => video.type === 'Trailer' && video.site === 'YouTube'
        )

        this.trailerKey = trailer ? trailer.key : null
        this.trailerUrl = trailer
            ? `https://www.youtube.com/embed/${trailer.key}`
            : null
      } catch (error) {
        console.error('Fehler beim Laden des Trailers:', error)
        this.trailerUrl = null
        this.trailerKey = null
      }
    },

    getCompanyLogo(path) {
      return `https://image.tmdb.org/t/p/w500${path}`
    },

    getInitials(name) {
      return name
          ? name
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0])
              .join('')
              .toUpperCase()
          : 'PF'
    },

    async addFavorite() {
      if (!this.isLoggedIn) {
        alert('Bitte einloggen, um Filme zu favorisieren.')
        return
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
        })

        if (response.ok) {
          alert('Film wurde zu den Favoriten hinzugefügt')
        } else {
          const errorData = await response.json()
          console.error('Fehler beim Hinzufügen des Favoriten:', errorData.message)
          alert(errorData.message || 'Fehler beim Hinzufügen zu den Favoriten.')
        }
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Favoriten:', error)
        alert('Serverfehler. Bitte versuchen Sie es später erneut.')
      }
    },
  },
}
</script>

<style scoped>
.movie-detail {
  width: min(100% - 12px, 1320px);
  margin: 0 auto;
  padding: 0.35rem 0 2.3rem;
  display: grid;
  gap: 1rem;
}

.movie-detail__hero {
  position: relative;
  border-radius: 1.45rem;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  box-shadow: var(--shadow-md);
}

.movie-detail__hero-backdrop {
  position: absolute;
  inset: 0;
}

.movie-detail__backdrop {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.movie-detail__backdrop-overlay {
  position: absolute;
  inset: 0;
  background:
      linear-gradient(180deg, rgba(4, 7, 16, 0.18) 0%, rgba(4, 7, 16, 0.82) 56%, rgba(4, 7, 16, 0.97) 100%),
      linear-gradient(90deg, rgba(4, 7, 16, 0.88) 0%, rgba(4, 7, 16, 0.56) 44%, rgba(4, 7, 16, 0.14) 100%);
}

.movie-detail__hero-card {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 5.8rem 1fr;
  gap: 0.9rem;
  align-items: end;
  min-height: 15.5rem;
  padding: 1rem;
}

.movie-detail__poster-wrap {
  align-self: start;
}

.movie-detail__poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 1rem;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
}

.movie-detail__hero-copy {
  display: grid;
  gap: 0.6rem;
  align-content: end;
  min-width: 0;
}

.movie-detail__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.66);
  font-weight: 800;
}

.movie-detail__title {
  margin: 0;
  font-size: clamp(1.65rem, 7vw, 4.8rem);
  line-height: 0.94;
  letter-spacing: -0.05em;
  color: white;
  max-width: 12ch;
}

.movie-detail__tagline {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.92rem;
  line-height: 1.45;
}

.movie-detail__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.detail-chip {
  min-height: 2rem;
  padding: 0 0.76rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 0.76rem;
  font-weight: 700;
  color: white;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.movie-detail__overview {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.93rem;
  line-height: 1.6;
  max-width: 62ch;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-detail__actions {
  display: flex;
}

.favorite-button {
  min-height: 2.7rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: var(--primary);
  color: var(--primary-foreground);
  font-weight: 800;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
}

.movie-detail__grid {
  display: grid;
  gap: 1rem;
}

.detail-showcase {
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in oklab, white 8%, transparent);
  border-radius: 1.45rem;
  background: linear-gradient(180deg, rgba(10, 18, 34, 0.96) 0%, rgba(8, 14, 28, 0.98) 100%);
  box-shadow:
      0 20px 46px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  min-height: 34rem;
}

.detail-showcase__backdrop {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.08);
}

.detail-showcase__backdrop-blur {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(18px);
  background: rgba(6, 10, 20, 0.18);
}

.detail-showcase__backdrop-fade {
  position: absolute;
  inset: 0;
  background:
      radial-gradient(circle at 50% 26%, rgba(255, 255, 255, 0.08), transparent 34%),
      linear-gradient(180deg, rgba(6, 10, 20, 0.12) 0%, rgba(6, 10, 20, 0.58) 42%, rgba(6, 10, 20, 0.94) 100%);
}

.detail-showcase__inner {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.detail-showcase__media {
  display: grid;
  gap: 1rem;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}

.section-head--integrated {
  margin-bottom: 0.1rem;
}

.section-kicker {
  margin: 0 0 0.38rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.section-head h2 {
  margin: 0;
  font-size: clamp(1.14rem, 1.9vw, 1.7rem);
  line-height: 1.03;
  letter-spacing: -0.03em;
  color: #f8fbff;
}

.section-subtitle {
  margin: 0.45rem 0 0;
  max-width: 50ch;
  color: rgba(232, 238, 255, 0.76);
  font-size: 0.92rem;
  line-height: 1.55;
}

.section-subtitle--overlay {
  max-width: 56ch;
}

.section-meta {
  color: rgba(230, 236, 250, 0.86);
  font-size: 0.82rem;
  white-space: nowrap;
}

.section-meta--pill {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0 0.82rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(8px);
}

.video-stage {
  display: grid;
  place-items: center;
}

.video-frame {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #050b14;
}

.video-frame--showcase {
  width: min(100%, 1100px);
  aspect-ratio: 16 / 9;
  box-shadow:
      0 22px 50px rgba(0, 0, 0, 0.32),
      0 0 0 1px rgba(255, 255, 255, 0.03);
}

.video-frame iframe {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}

.detail-showcase__body {
  display: grid;
  gap: 1rem;
  padding-top: 0.2rem;
}

.info-inline {
  display: grid;
  gap: 0.7rem;
  padding: 1rem 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.info-inline__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.1rem 0;
}

.info-inline__label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(210, 220, 255, 0.54);
}

.info-inline__value {
  text-align: right;
  font-size: 0.98rem;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #f5f7ff;
}

.companies-block {
  display: grid;
  gap: 0.85rem;
}

.companies-block--integrated {
  padding: 0 1rem 1rem;
}

.subsection-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.subsection-head--soft h3 {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.15;
  color: #f4f7ff;
}

.subsection-head--soft span {
  color: rgba(220, 228, 245, 0.68);
  font-size: 0.82rem;
}

.companies-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.company-card {
  min-height: 5.1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(10, 16, 28, 0.38);
  backdrop-filter: blur(12px);
  display: grid;
  grid-template-columns: 3.9rem 1fr;
  gap: 0.85rem;
  align-items: center;
  padding: 0.85rem;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.company-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(14, 22, 36, 0.5);
}

.company-card__logo-wrap {
  width: 3.9rem;
  height: 3.9rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.96);
  display: grid;
  place-items: center;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
}

.company-card__logo {
  width: 74%;
  height: 74%;
  object-fit: contain;
}

.company-card__fallback {
  color: #0b1220;
  font-weight: 800;
  font-size: 0.88rem;
  letter-spacing: 0.04em;
}

.company-card__body {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
}

.company-card__body strong {
  line-height: 1.15;
  font-size: 1rem;
  letter-spacing: -0.02em;
  color: #f4f7ff;
}

.company-card__body span {
  color: rgba(220, 228, 245, 0.68);
  font-size: 0.84rem;
}

.empty-box {
  min-height: 10rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(10, 16, 28, 0.36);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: 1rem;
  text-align: center;
  color: rgba(220, 228, 245, 0.74);
}

.empty-box--feature {
  min-height: 18rem;
}

.empty-box--compact {
  min-height: 6.5rem;
}

@media (max-width: 420px) {
  .movie-detail__hero-card {
    grid-template-columns: 4.9rem 1fr;
  }

  .movie-detail__overview {
    -webkit-line-clamp: 4;
  }

  .info-inline__item {
    align-items: start;
    flex-direction: column;
    gap: 0.18rem;
  }

  .info-inline__value {
    text-align: left;
  }
}

@media (min-width: 768px) {
  .movie-detail {
    width: min(100% - 24px, 1320px);
    padding: 0.55rem 0 3.2rem;
    gap: 1.2rem;
  }

  .movie-detail__hero {
    border-radius: 1.75rem;
  }

  .movie-detail__hero-card {
    grid-template-columns: 13rem minmax(0, 1fr);
    gap: 1.45rem;
    min-height: 24rem;
    padding: 1.35rem;
  }

  .movie-detail__hero-copy {
    gap: 0.82rem;
  }

  .movie-detail__title {
    font-size: clamp(2.4rem, 5vw, 5rem);
  }

  .movie-detail__tagline {
    font-size: 1rem;
  }

  .movie-detail__overview {
    font-size: 0.98rem;
    line-height: 1.68;
    -webkit-line-clamp: 6;
  }

  .detail-chip {
    min-height: 2.05rem;
    font-size: 0.8rem;
  }

  .detail-showcase {
    min-height: 39rem;
  }

  .detail-showcase__inner {
    gap: 1.1rem;
    padding: 1.2rem;
  }

  .section-head h2 {
    font-size: clamp(1.3rem, 1.8vw, 1.85rem);
  }

  .info-inline {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem 1.2rem;
    padding: 1.1rem 1.1rem 0;
  }

  .info-inline__item {
    display: grid;
    gap: 0.2rem;
  }

  .info-inline__value {
    text-align: left;
  }

  .companies-block--integrated {
    padding: 0 1.1rem 1.1rem;
  }

  .companies-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .detail-showcase {
    min-height: 44rem;
  }

  .detail-showcase__inner {
    padding: 1.35rem;
  }

  .video-frame--showcase {
    width: min(100%, 1180px);
  }

  .info-inline {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>