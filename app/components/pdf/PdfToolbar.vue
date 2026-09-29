<script setup lang="ts">
const pageNumber = defineModel<number>('pageNumber', { required: true })
const scale = defineModel<number>('scale', { required: true })
const searchQuery = defineModel<string>('searchQuery', { required: true })

defineProps<{
  pageCount: number
  matchCount: number
  activeMatchIndex: number
  loading?: boolean
}>()

const emit = defineEmits<{
  prevPage: []
  nextPage: []
  zoomIn: []
  zoomOut: []
  search: []
  prevMatch: []
  nextMatch: []
}>()

const zoomOptions = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 },
  { label: '300%', value: 3 }
]
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-b border-default pb-3">
    <div class="flex flex-wrap items-center gap-1.5">
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="pageNumber <= 1 || loading"
        aria-label="Предыдущая страница"
        @click="emit('prevPage')"
      />
      <div class="flex items-center gap-1 text-sm tabular-nums">
        <UInput
          v-model.number="pageNumber"
          type="number"
          size="sm"
          class="w-14"
          :min="1"
          :max="pageCount || 1"
          :disabled="loading"
        />
        <span class="text-muted">/ {{ pageCount || '—' }}</span>
      </div>
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="pageNumber >= pageCount || loading"
        aria-label="Следующая страница"
        @click="emit('nextPage')"
      />

      <USeparator orientation="vertical" class="mx-1 h-6" />

      <UButton
        icon="i-lucide-minus"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="scale <= 0.5 || loading"
        aria-label="Уменьшить"
        @click="emit('zoomOut')"
      />
      <USelect
        v-model="scale"
        :items="zoomOptions"
        value-key="value"
        size="sm"
        class="w-24"
        :disabled="loading"
      />
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="scale >= 3 || loading"
        aria-label="Увеличить"
        @click="emit('zoomIn')"
      />
    </div>

    <div class="ms-auto flex flex-wrap items-center justify-end gap-1.5">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Поиск по документу"
        size="sm"
        class="w-48 sm:w-56"
        :disabled="loading"
        @keydown.enter="emit('search')"
      />
      <UButton
        label="Найти"
        size="sm"
        color="primary"
        :disabled="loading || !searchQuery.trim()"
        @click="emit('search')"
      />
      <UButton
        icon="i-lucide-chevron-up"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="!matchCount"
        aria-label="Предыдущее совпадение"
        @click="emit('prevMatch')"
      />
      <UButton
        icon="i-lucide-chevron-down"
        color="neutral"
        variant="ghost"
        size="sm"
        :disabled="!matchCount"
        aria-label="Следующее совпадение"
        @click="emit('nextMatch')"
      />
      <span
        v-if="matchCount"
        class="text-xs text-muted tabular-nums"
      >
        {{ activeMatchIndex + 1 }} / {{ matchCount }}
      </span>
    </div>
  </div>
</template>
