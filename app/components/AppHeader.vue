<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Реестры и журналы',
    children: [
      { label: 'Реестр функций', to: '/' },
      { label: 'Реестр пользователей', disabled: true }
    ]
  },
  { label: 'Обмен данными', disabled: true },
  { label: 'Справочники', disabled: true },
  { label: 'Настройки', disabled: true }
])
</script>

<template>
  <UHeader title="PDF Reader">
    <template #title>
      <span class="flex items-center gap-2 font-semibold text-highlighted">
        <span class="inline-flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-inverted">
          PR
        </span>
        <span class="hidden sm:inline">PDF Reader</span>
      </span>
    </template>

    <UNavigationMenu
      :items="items"
      class="hidden lg:flex"
    />

    <template #right>
      <UColorModeButton />
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-user"
        aria-label="Профиль"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
