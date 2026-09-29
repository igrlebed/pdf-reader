<script setup lang="ts">
import type {
  RegistryCatalogModule,
  RegistryFormPayload,
  RegistryFunction
} from '~/types/registry'
import catalogsMock from '../../mocks/registry-catalogs.json'

const NONE = '__none__'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  item?: RegistryFunction | null
}>()

const emit = defineEmits<{
  submit: [payload: RegistryFormPayload]
  dismiss: []
  'before-close': []
}>()

// MOCK: replace with GET /api/v1/registry/catalogs
const catalogs = catalogsMock.modules as RegistryCatalogModule[]

const form = reactive({
  module: '',
  functionName: '',
  description: '',
  subsection: NONE,
  dtzPoint: '',
  tzPoint: ''
})

const pdfFile = ref<File | null>(null)
const submitted = ref(false)
const hydrating = ref(false)

const moduleItems = computed(() => catalogs.map(m => m.name))

const selectedModule = computed(() =>
  catalogs.find(m => m.name === form.module)
)

const functionItems = computed(() =>
  selectedModule.value?.functions.map(f => f.name) ?? []
)

const selectedFunction = computed(() =>
  selectedModule.value?.functions.find(f => f.name === form.functionName)
)

const descriptionItems = computed(() =>
  selectedFunction.value?.descriptions ?? []
)

const subsectionItems = computed(() => {
  const items = selectedFunction.value?.subsections ?? []
  return [
    { label: 'Не выбран', value: NONE },
    ...items.map(s => ({ label: s, value: s }))
  ]
})

const isCreate = computed(() => props.mode === 'create')

const title = computed(() =>
  isCreate.value ? 'Добавление записи' : 'Редактирование записи'
)

const canSubmit = computed(() => {
  const base = Boolean(
    form.module
    && form.functionName
    && form.description
    && form.dtzPoint.trim()
    && form.tzPoint.trim()
  )
  if (!isCreate.value) return base
  return base && Boolean(pdfFile.value)
})

function resetForm() {
  form.module = ''
  form.functionName = ''
  form.description = ''
  form.subsection = NONE
  form.dtzPoint = ''
  form.tzPoint = ''
  pdfFile.value = null
}

function fillFromItem(item: RegistryFunction) {
  hydrating.value = true
  form.module = item.module
  form.functionName = item.function
  form.description = item.description
  form.subsection = item.subsection || NONE
  form.dtzPoint = item.dtzPoint
  form.tzPoint = item.tzPoint
  pdfFile.value = null
  nextTick(() => {
    hydrating.value = false
  })
}

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  submitted.value = false
  if (props.mode === 'edit' && props.item) {
    fillFromItem(props.item)
    return
  }
  resetForm()
})

watch(() => form.module, () => {
  if (hydrating.value) return
  form.functionName = ''
  form.description = ''
  form.subsection = NONE
})

watch(() => form.functionName, () => {
  if (hydrating.value) return
  form.description = ''
  form.subsection = NONE
})

function dismiss() {
  emit('before-close')
  emit('dismiss')
}

function onSubmit() {
  submitted.value = true
  if (!canSubmit.value) return

  emit('submit', {
    module: form.module,
    function: form.functionName,
    description: form.description,
    subsection: form.subsection === NONE ? null : form.subsection,
    dtzPoint: form.dtzPoint.trim(),
    tzPoint: form.tzPoint.trim(),
    pdfFile: isCreate.value ? pdfFile.value : null
  })
  dismiss()
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) dismiss()
}

onMounted(() => {
  document.addEventListener('keydown', onEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <div
    v-show="open"
    class="fixed inset-0 z-50 flex justify-end"
    data-registry-form-panel
  >
    <button
      type="button"
      class="absolute inset-0 bg-black/40"
      aria-label="Закрыть"
      @click="dismiss"
    />

    <aside
      class="relative flex h-full w-[min(100%,32rem)] flex-col border-l border-default bg-default shadow-lg"
      @click.stop
    >
      <header class="flex items-start justify-between gap-3 border-b border-default p-4 sm:p-6">
        <div class="min-w-0">
          <h2 class="text-highlighted text-lg font-semibold">
            {{ title }}
          </h2>
          <p class="mt-1 text-sm text-muted">
            Заполните поля карточки функции
          </p>
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          square
          aria-label="Закрыть"
          @click="dismiss"
        />
      </header>

      <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
        <UFormField
          label="Модуль"
          name="module"
          required
        >
          <USelect
            v-model="form.module"
            :items="moduleItems"
            placeholder="Выберите модуль"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Функция"
          name="function"
          required
        >
          <USelect
            v-model="form.functionName"
            :items="functionItems"
            placeholder="Выберите функцию"
            class="w-full"
            :disabled="!form.module"
          />
        </UFormField>

        <UFormField
          label="Описание функции"
          name="description"
          required
        >
          <USelect
            v-model="form.description"
            :items="descriptionItems"
            placeholder="Выберите описание"
            class="w-full"
            :disabled="!form.functionName"
          />
        </UFormField>

        <UFormField
          label="Подраздел"
          name="subsection"
          hint="Необязательно"
        >
          <USelect
            v-model="form.subsection"
            :items="subsectionItems"
            value-key="value"
            placeholder="Выберите подраздел"
            class="w-full"
            :disabled="!form.functionName"
          />
        </UFormField>

        <UFormField
          label="Пункт ДТЗ"
          name="dtzPoint"
          required
        >
          <UInput
            v-model="form.dtzPoint"
            placeholder="Например, ДТЗ-1.2.1"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Пункт ТЗ"
          name="tzPoint"
          required
        >
          <UInput
            v-model="form.tzPoint"
            placeholder="Например, ТЗ-3.1"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="isCreate"
          label="PDF-файл"
          name="pdf"
          required
          :error="submitted && !pdfFile ? 'Загрузите PDF-файл' : undefined"
        >
          <UFileUpload
            v-model="pdfFile"
            accept="application/pdf,.pdf"
            label="Перетащите PDF или нажмите для выбора"
            description="Только PDF, один файл"
            class="min-h-36 w-full"
          />
        </UFormField>
      </div>

      <footer class="flex justify-end gap-2 border-t border-default p-4 sm:p-6">
        <UButton
          label="Отмена"
          color="neutral"
          variant="outline"
          @click="dismiss"
        />
        <UButton
          :label="isCreate ? 'Добавить' : 'Сохранить'"
          color="primary"
          :disabled="!canSubmit"
          @click="onSubmit"
        />
      </footer>
    </aside>
  </div>
</template>
