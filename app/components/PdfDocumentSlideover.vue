<script setup lang="ts">
import type { RegistryFunction } from '~/types/registry'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  item: RegistryFunction | null
}>()

const title = computed(() => props.item?.function ?? 'Документ')
const description = computed(() => {
  if (!props.item) return ''
  return `${props.item.module} · ${props.item.dtzPoint} · ${props.item.tzPoint}`
})
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="title"
    :description="description"
    :ui="{
      content: 'max-w-3xl w-[min(100%,48rem)]',
      body: 'flex min-h-0 flex-1 flex-col p-4 sm:p-6'
    }"
  >
    <template #body>
      <ClientOnly>
        <PdfViewer
          v-if="open && item?.pdfUrl"
          :src="item.pdfUrl"
          class="h-[min(80vh,720px)]"
        />
        <template #fallback>
          <div class="flex h-64 items-center justify-center text-muted">
            Загрузка просмотрщика…
          </div>
        </template>
      </ClientOnly>
    </template>
  </USlideover>
</template>
