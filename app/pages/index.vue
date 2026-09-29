<script setup lang="ts">
import type { RegistryFunction } from '~/types/registry'
import registryMock from '../../mocks/registry-functions.json'

useHead({
  htmlAttrs: { lang: 'ru' }
})

useSeoMeta({
  title: 'Реестр функций',
  description: 'Реестр функций модулей с просмотром PDF в Slideover'
})

const rows = ref(structuredClone(registryMock) as RegistryFunction[])
const slideoverOpen = ref(false)
const selected = ref<RegistryFunction | null>(null)

function onSelect(row: RegistryFunction) {
  selected.value = row
  slideoverOpen.value = true
}
</script>

<template>
  <div class="flex w-full flex-col gap-6 p-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-balance text-2xl font-semibold text-highlighted">
          Реестр функций
        </h1>
        <p class="mt-1 text-sm text-muted">
          Клик по строке с PDF открывает документ в боковой панели
        </p>
      </div>
    </div>

    <UCard :ui="{ body: 'p-4 sm:p-5', root: 'bg-default shadow-sm' }">
      <RegistryTable
        :data="rows"
        @select="onSelect"
      />
    </UCard>

    <PdfDocumentSlideover
      v-model:open="slideoverOpen"
      :item="selected"
    />
  </div>
</template>
