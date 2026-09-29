<script setup lang="ts">
const props = defineProps<{
  src: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const textLayerRef = ref<HTMLElement | null>(null)

const {
  loading,
  rendering,
  error,
  pageNumber,
  pageCount,
  scale,
  searchQuery,
  matches,
  activeMatchIndex,
  load,
  renderPage,
  runSearch,
  nextPage,
  prevPage,
  zoomIn,
  zoomOut,
  nextMatch,
  prevMatch,
  destroy
} = usePdfDocument()

async function paint() {
  await nextTick()
  if (canvasRef.value) {
    await renderPage(canvasRef.value, textLayerRef.value)
  }
}

watch(() => props.src, async (url) => {
  if (!url) return
  await load(url)
  await paint()
}, { immediate: true })

watch([pageNumber, scale, activeMatchIndex], async () => {
  await paint()
})

const viewportRef = ref<HTMLElement | null>(null)
let wheelLockUntil = 0

function onWheel(event: WheelEvent) {
  if (loading.value || rendering.value || pageCount.value <= 1) return

  const el = viewportRef.value
  if (!el) return

  const delta = event.deltaY
  if (delta === 0) return

  const atTop = el.scrollTop <= 1
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
  const canScroll = el.scrollHeight > el.clientHeight + 2

  const goingDown = delta > 0
  const goingUp = delta < 0

  const shouldTurnPage = goingDown
    ? (!canScroll || atBottom) && pageNumber.value < pageCount.value
    : (!canScroll || atTop) && pageNumber.value > 1

  if (!shouldTurnPage) return

  event.preventDefault()

  const now = Date.now()
  if (now < wheelLockUntil) return
  wheelLockUntil = now + 280

  if (goingDown) {
    nextPage()
    nextTick(() => {
      if (viewportRef.value) viewportRef.value.scrollTop = 0
    })
  } else {
    prevPage()
    nextTick(() => {
      const view = viewportRef.value
      if (view) view.scrollTop = view.scrollHeight
    })
  }
}

onBeforeUnmount(() => {
  void destroy()
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-3">
    <PdfToolbar
      v-model:page-number="pageNumber"
      v-model:scale="scale"
      v-model:search-query="searchQuery"
      :page-count="pageCount"
      :match-count="matches.length"
      :active-match-index="activeMatchIndex"
      :loading="loading"
      @prev-page="prevPage"
      @next-page="nextPage"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @search="runSearch(searchQuery)"
      @prev-match="prevMatch"
      @next-match="nextMatch"
    />

    <div
      v-if="error"
      class="rounded-md bg-error/10 px-3 py-2 text-sm text-error"
    >
      {{ error }}
    </div>

    <div
      v-else
      ref="viewportRef"
      class="relative min-h-0 flex-1 overflow-auto rounded-md bg-muted/40 p-3"
      @wheel="onWheel"
    >
      <div
        v-if="loading || rendering"
        class="absolute inset-0 z-10 flex items-center justify-center bg-default/40"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-primary"
        />
      </div>

      <div class="relative mx-auto w-fit shadow-sm">
        <canvas ref="canvasRef" class="block bg-white" />
        <div
          ref="textLayerRef"
          class="pdf-text-layer absolute inset-0 overflow-hidden leading-none text-transparent"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-text-layer :deep(span) {
  position: absolute;
  white-space: pre;
  transform-origin: 0% 0%;
  color: transparent;
}

.pdf-text-layer :deep(.pdf-search-hit) {
  background: color-mix(in oklab, var(--ui-warning) 45%, transparent);
}

.pdf-text-layer :deep(.pdf-search-hit-active) {
  background: color-mix(in oklab, var(--ui-primary) 55%, transparent);
}
</style>
