<template>
  <nav v-if="totalPages > 1" class="pagination-bar" aria-label="Seitennavigation">
    <button
        type="button"
        class="pagination-bar__button"
        :disabled="page <= 1"
        @click="onPageChange(page - 1)"
    >
      ← Zurück
    </button>

    <div class="pagination-bar__pages">
      <template v-for="p in pages" :key="String(p)">
        <button
            v-if="p !== '…'"
            type="button"
            :class="['pagination-bar__page', { 'is-active': p === page }]"
            @click="onPageChange(p)"
        >
          {{ p }}
        </button>
        <span v-else class="pagination-bar__ellipsis">…</span>
      </template>
    </div>

    <button
        type="button"
        class="pagination-bar__button"
        :disabled="page >= totalPages"
        @click="onPageChange(page + 1)"
    >
      Weiter →
    </button>
  </nav>
</template>

<script>
export default {
  name: 'PaginationBar',
  props: {
    page: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  emits: ['page-change'],
  computed: {
    pages() {
      const total = this.totalPages
      const page = this.page
      const pages = []
      const add = (p) => pages.push(p)
      const span = 1

      add(1)

      if (page - span > 2) pages.push('…')

      for (let p = Math.max(2, page - span); p <= Math.min(total - 1, page + span); p++) {
        add(p)
      }

      if (page + span < total - 1) pages.push('…')

      if (total > 1) add(total)

      return pages
    },
  },
  methods: {
    onPageChange(p) {
      this.$emit('page-change', p)
    },
  },
}
</script>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-bar__button,
.pagination-bar__page {
  min-width: 2.5rem;
  min-height: 2.5rem;
  padding: 0 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  font-weight: 600;
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
}

.pagination-bar__page {
  min-width: 2.5rem;
  padding: 0;
}

.pagination-bar__page.is-active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
}

.pagination-bar__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-bar__pages {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pagination-bar__ellipsis {
  color: var(--muted-foreground);
  padding: 0 0.15rem;
}
</style>