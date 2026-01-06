<script setup lang="ts">
import { useAppStore } from '@/stores/appState'

const appStore = useAppStore()
</script>

<template>
  <div class="ui-overlay" :class="{ 'is-loading': appStore.isLoading }">
    <!-- Main Content -->
    <main v-show="!appStore.isLoading" class="content-layer">
      <slot />
    </main>

    <!-- Loading Screen (Phase A) - Made transparent to show 3D spiral -->
    <Transition name="fade">
      <div v-if="appStore.isLoading" class="loading-screen">
        <div class="loader-content">
          <!-- We show the 3D spiral from the background, so we just keep this as a container -->
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.ui-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;

  .content-layer {
    pointer-events: auto;
    width: 100%;
    height: 100%;
  }

  .loading-screen {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent; // Show the 3D world
    pointer-events: auto;
    z-index: 100;

    .loader-content {
      text-align: center;
    }
  }
}

.fade-leave-active {
  transition: opacity 1.5s ease;
}
.fade-leave-to {
  opacity: 0;
}
</style>
