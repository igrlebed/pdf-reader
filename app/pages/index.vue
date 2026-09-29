<script setup lang="ts">
import type { RegistryFormPayload, RegistryFunction } from '~/types/registry'
import registryMock from '../../mocks/registry-functions.json'

useHead({
  htmlAttrs: { lang: 'ru' }
})

useSeoMeta({
  title: 'Реестр функций',
  description: 'Реестр функций модулей с просмотром PDF в Slideover'
})

const toast = useToast()

// MOCK: replace with GET /api/v1/registry/functions
const rows = ref(structuredClone(registryMock) as RegistryFunction[])

const pdfSlideoverOpen = ref(false)
const selectedPdf = ref<RegistryFunction | null>(null)

const formOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingItem = ref<RegistryFunction | null>(null)
/** Blocks pointer hits on the table while the form overlay is dismissing */
const tablePointerBlocked = ref(false)
let tableUnblockTimer: ReturnType<typeof setTimeout> | null = null

const deleteOpen = ref(false)
const deletingItem = ref<RegistryFunction | null>(null)

function armFormCloseGuard() {
  tablePointerBlocked.value = true
  if (tableUnblockTimer) clearTimeout(tableUnblockTimer)
  tableUnblockTimer = setTimeout(() => {
    tablePointerBlocked.value = false
    tableUnblockTimer = null
  }, 400)
}

function openPdf(row: RegistryFunction) {
  if (tablePointerBlocked.value) return
  selectedPdf.value = row
  pdfSlideoverOpen.value = true
}

function openCreate() {
  formMode.value = 'create'
  editingItem.value = null
  formOpen.value = true
}

function openEdit(row: RegistryFunction) {
  if (tablePointerBlocked.value) return
  formMode.value = 'edit'
  editingItem.value = row
  formOpen.value = true
}

function closeFormPanel() {
  armFormCloseGuard()
  formOpen.value = false
  editingItem.value = null
}

function renumber() {
  rows.value.forEach((row, index) => {
    row.number = index + 1
  })
}

function onFormSubmit(payload: RegistryFormPayload) {
  if (formMode.value === 'create') {
    const file = payload.pdfFile
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    const nextId = String(Date.now())

    // MOCK: replace with POST /api/v1/registry/functions (multipart)
    rows.value.push({
      id: nextId,
      number: rows.value.length + 1,
      module: payload.module,
      function: payload.function,
      description: payload.description,
      subsection: payload.subsection,
      dtzPoint: payload.dtzPoint,
      tzPoint: payload.tzPoint,
      status: 'shown',
      pdfUrl: objectUrl,
      pdfFileName: file.name
    })

    toast.add({
      title: 'Запись добавлена',
      description: `«${payload.function}» добавлена в реестр`,
      color: 'success',
      icon: 'i-lucide-check'
    })
  } else if (editingItem.value) {
    // MOCK: replace with PATCH /api/v1/registry/functions/:id
    editingItem.value.module = payload.module
    editingItem.value.function = payload.function
    editingItem.value.description = payload.description
    editingItem.value.subsection = payload.subsection
    editingItem.value.dtzPoint = payload.dtzPoint
    editingItem.value.tzPoint = payload.tzPoint

    toast.add({
      title: 'Изменения сохранены',
      description: `«${payload.function}» обновлена`,
      color: 'success',
      icon: 'i-lucide-check'
    })
  }
}

function onDownload(row: RegistryFunction) {
  if (!row.pdfUrl) {
    toast.add({
      title: 'PDF отсутствует',
      color: 'warning',
      icon: 'i-lucide-file-x'
    })
    return
  }

  const link = document.createElement('a')
  link.href = row.pdfUrl
  link.download = row.pdfFileName || `${row.function}.pdf`
  link.target = '_blank'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function askDelete(row: RegistryFunction) {
  deletingItem.value = row
  deleteOpen.value = true
}

function confirmDelete() {
  const item = deletingItem.value
  if (!item) return

  if (item.pdfUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(item.pdfUrl)
  }

  rows.value = rows.value.filter(row => row.id !== item.id)
  renumber()

  if (selectedPdf.value?.id === item.id) {
    pdfSlideoverOpen.value = false
    selectedPdf.value = null
  }

  toast.add({
    title: 'Запись удалена',
    description: `«${item.function}» удалена из реестра`,
    color: 'neutral',
    icon: 'i-lucide-trash-2'
  })

  deleteOpen.value = false
  deletingItem.value = null
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

      <UButton
        label="Добавить запись"
        icon="i-lucide-plus"
        color="primary"
        @click="openCreate"
      />
    </div>

    <UCard
      :class="{ 'pointer-events-none': tablePointerBlocked }"
      :ui="{ body: 'p-4 sm:p-5', root: 'bg-default shadow-sm' }"
    >
      <RegistryTable
        :data="rows"
        @select="openPdf"
        @edit="openEdit"
        @download="onDownload"
        @remove="askDelete"
      />
    </UCard>

    <PdfDocumentSlideover
      v-model:open="pdfSlideoverOpen"
      :item="selectedPdf"
    />

    <RegistryRecordForm
      :open="formOpen"
      :mode="formMode"
      :item="editingItem"
      @before-close="armFormCloseGuard"
      @dismiss="closeFormPanel"
      @submit="onFormSubmit"
    />

    <UModal
      v-model:open="deleteOpen"
      title="Удалить запись?"
      :description="deletingItem ? `Функция «${deletingItem.function}» будет удалена без возможности восстановления.` : undefined"
    >
      <template #footer="{ close }">
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Отмена"
            color="neutral"
            variant="outline"
            @click="close"
          />
          <UButton
            label="Удалить"
            color="error"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
