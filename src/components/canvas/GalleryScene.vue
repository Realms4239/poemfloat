<script setup lang="ts">
import { useAppStore } from '@/stores/appState'

const appStore = useAppStore()
</script>

<template>
  <TresGroup>
    <template v-for="(poem, index) in appStore.poems" :key="poem.id">
      <PoemCard :poem="poem" :index="index" />
    </template>
  </TresGroup>
</template>
