<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'ru'
  }
})
</script>

<template>
  <UApp>
    <AppHeader />
    <UMain class="min-h-[calc(100dvh-var(--ui-header-height))] bg-[#F8FAFC]">
      <NuxtPage />
    </UMain>
  </UApp>
</template>
