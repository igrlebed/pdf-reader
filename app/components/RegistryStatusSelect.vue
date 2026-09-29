<script setup lang="ts">
import type { RegistryStatus } from '~/types/registry'

const status = defineModel<RegistryStatus>({ required: true })

const items = [
  { label: 'Показывается', value: 'visible' as const },
  { label: 'Скрыт', value: 'hidden' as const }
]
</script>

<template>
  <USelect
    v-model="status"
    :items="items"
    value-key="value"
    size="sm"
    class="w-40"
    :ui="{
      base: status === 'visible'
        ? 'ring-success/30 text-success'
        : 'ring-default text-muted'
    }"
    @click.stop
  />
</template>
