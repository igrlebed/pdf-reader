<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { RegistryFunction } from '~/types/registry'

const props = defineProps<{
  data: RegistryFunction[]
}>()

const emit = defineEmits<{
  select: [row: RegistryFunction]
}>()

const toast = useToast()

const UIcon = resolveComponent('UIcon')
const RegistryStatusSelect = resolveComponent('RegistryStatusSelect')

const columns: TableColumn<RegistryFunction>[] = [
  {
    accessorKey: 'number',
    header: '№ п/п',
    meta: { class: { th: 'w-16', td: 'w-16 tabular-nums' } }
  },
  {
    accessorKey: 'module',
    header: 'Модуль'
  },
  {
    accessorKey: 'function',
    header: 'Функция'
  },
  {
    accessorKey: 'description',
    header: 'Описание функции',
    cell: ({ row }) => h('span', { class: 'line-clamp-2 max-w-xs text-muted' }, row.original.description)
  },
  {
    accessorKey: 'dtzPoint',
    header: 'Пункт ДТЗ'
  },
  {
    accessorKey: 'tzPoint',
    header: 'Пункт ТЗ'
  },
  {
    accessorKey: 'status',
    header: 'Статус',
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
    cell: ({ row }) => h('div', { class: 'flex items-center gap-1.5' }, [
      h(UIcon, {
        name: row.original.hasPdf ? 'i-lucide-file-text' : 'i-lucide-file-x',
        class: row.original.hasPdf ? 'size-4 text-primary' : 'size-4 text-muted'
      }),
      h('span', { class: 'text-sm' }, row.original.hasPdf ? 'Есть' : 'Нет')
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
      row.dtzPoint,
      row.tzPoint
    ].some(v => v.toLowerCase().includes(q))
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

    <UTable
      :data="pageRows"
      :columns="columns"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        tr: 'data-[selectable=true]:hover:bg-elevated/50 data-[selectable=true]:cursor-pointer',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
      @select="onSelect"
    />

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
