<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { RegistryFunction } from '~/types/registry'

const props = defineProps<{
  data: RegistryFunction[]
}>()

const emit = defineEmits<{
  select: [row: RegistryFunction]
  edit: [row: RegistryFunction]
  download: [row: RegistryFunction]
  remove: [row: RegistryFunction]
}>()

const toast = useToast()

const UIcon = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')
const RegistryStatusSelect = resolveComponent('RegistryStatusSelect')

const columns: TableColumn<RegistryFunction>[] = [
  {
    accessorKey: 'number',
    header: '№ п/п',
    meta: { class: { th: 'w-16 whitespace-nowrap', td: 'w-16 tabular-nums' } }
  },
  {
    accessorKey: 'module',
    header: 'Модуль',
    meta: { class: { th: 'whitespace-nowrap min-w-0 w-[12%]', td: 'min-w-0 w-[12%] overflow-hidden' } },
    cell: ({ row }) => h('span', {
      class: 'block truncate',
      title: row.original.module
    }, row.original.module)
  },
  {
    accessorKey: 'function',
    header: 'Функция',
    meta: { class: { th: 'whitespace-nowrap min-w-0 w-[16%]', td: 'min-w-0 w-[16%] overflow-hidden' } },
    cell: ({ row }) => h('span', {
      class: 'block truncate',
      title: row.original.function
    }, row.original.function)
  },
  {
    accessorKey: 'description',
    header: 'Описание функции',
    meta: {
      class: {
        th: 'whitespace-nowrap min-w-0 w-[22%]',
        td: 'min-w-0 w-[22%] overflow-hidden'
      }
    },
    cell: ({ row }) => h('span', {
      class: 'block truncate text-muted',
      title: row.original.description
    }, row.original.description)
  },
  {
    accessorKey: 'subsection',
    header: 'Подраздел',
    meta: { class: { th: 'whitespace-nowrap min-w-0 w-[10%]', td: 'min-w-0 w-[10%] overflow-hidden' } },
    cell: ({ row }) => {
      const value = row.original.subsection || '—'
      return h('span', { class: 'block truncate text-muted', title: value }, value)
    }
  },
  {
    accessorKey: 'dtzPoint',
    header: 'Пункт ДТЗ',
    meta: { class: { th: 'whitespace-nowrap min-w-0 w-[10%]', td: 'min-w-0 w-[10%] overflow-hidden' } },
    cell: ({ row }) => h('span', {
      class: 'block truncate',
      title: row.original.dtzPoint
    }, row.original.dtzPoint)
  },
  {
    accessorKey: 'tzPoint',
    header: 'Пункт ТЗ',
    meta: { class: { th: 'whitespace-nowrap min-w-0 w-[8%]', td: 'min-w-0 w-[8%] overflow-hidden' } },
    cell: ({ row }) => h('span', {
      class: 'block truncate',
      title: row.original.tzPoint
    }, row.original.tzPoint)
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    meta: { class: { th: 'whitespace-nowrap w-44', td: 'w-44' } },
    cell: ({ row }) => h(RegistryStatusSelect, {
      modelValue: row.original.status,
      'onUpdate:modelValue': (value: RegistryFunction['status']) => {
        row.original.status = value
      }
    })
  },
  {
    accessorKey: 'hasPdf',
    header: 'PDF',
    meta: { class: { th: 'whitespace-nowrap w-24', td: 'w-24' } },
    cell: ({ row }) => h('div', { class: 'flex items-center gap-1.5' }, [
      h(UIcon, {
        name: row.original.hasPdf ? 'i-lucide-file-text' : 'i-lucide-file-x',
        class: row.original.hasPdf ? 'size-4 shrink-0 text-primary' : 'size-4 shrink-0 text-muted'
      }),
      h('span', { class: 'text-sm' }, row.original.hasPdf ? 'Есть' : 'Нет')
    ])
  },
  {
    id: 'actions',
    header: 'Действия',
    meta: { class: { th: 'w-28 whitespace-nowrap', td: 'w-28' } },
    cell: ({ row }) => h('div', {
      class: 'flex items-center gap-0.5',
      onClick: (e: Event) => e.stopPropagation()
    }, [
      h(UButton, {
        size: 'xs',
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-pencil',
        square: true,
        'aria-label': 'Редактировать',
        onClick: (e: Event) => {
          e.stopPropagation()
          emit('edit', row.original)
        }
      }),
      h(UButton, {
        size: 'xs',
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-download',
        square: true,
        'aria-label': 'Скачать',
        disabled: !row.original.hasPdf || !row.original.pdfUrl,
        onClick: (e: Event) => {
          e.stopPropagation()
          emit('download', row.original)
        }
      }),
      h(UButton, {
        size: 'xs',
        color: 'error',
        variant: 'ghost',
        icon: 'i-lucide-trash-2',
        square: true,
        'aria-label': 'Удалить',
        onClick: (e: Event) => {
          e.stopPropagation()
          emit('remove', row.original)
        }
      })
    ])
  }
]

const page = ref(1)
const pageCount = 8

const filteredSearch = ref('')

const filteredData = computed(() => {
  const q = filteredSearch.value.trim().toLowerCase()
  if (!q) return props.data
  return props.data.filter((row) => {
    return [
      row.module,
      row.function,
      row.description,
      row.subsection,
      row.dtzPoint,
      row.tzPoint
    ].some(v => (v ?? '').toLowerCase().includes(q))
  })
})

const pageRows = computed(() => {
  const start = (page.value - 1) * pageCount
  return filteredData.value.slice(start, start + pageCount)
})

watch(filteredSearch, () => {
  page.value = 1
})

function onSelect(_event: Event, row: TableRow<RegistryFunction>) {
  const item = row.original
  if (!item.hasPdf || !item.pdfUrl) {
    toast.add({
      title: 'PDF отсутствует',
      description: `У функции «${item.function}» нет PDF-файла`,
      color: 'warning',
      icon: 'i-lucide-file-x'
    })
    return
  }
  emit('select', item)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <UInput
        v-model="filteredSearch"
        icon="i-lucide-search"
        placeholder="Поиск"
        class="w-full max-w-xs"
      />
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        aria-label="Обновить"
        @click="filteredSearch = ''"
      />
    </div>

    <div class="w-full overflow-x-auto">
      <UTable
        :data="pageRows"
        :columns="columns"
        class="min-w-[68rem] w-full"
        :ui="{
          base: 'min-w-[68rem] w-full table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          tr: 'data-[selectable=true]:hover:bg-elevated/50 data-[selectable=true]:cursor-pointer',
          th: 'py-2 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default overflow-hidden'
        }"
        @select="onSelect"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default pt-3">
      <p class="text-sm text-muted">
        {{ filteredData.length }} записей · {{ pageCount }} на странице
      </p>
      <UPagination
        v-model="page"
        :total="filteredData.length"
        :items-per-page="pageCount"
        :sibling-count="1"
        show-edges
      />
    </div>
  </div>
</template>
