<script setup>
import { onMounted } from 'vue'
import mediumZoom from 'medium-zoom'

onMounted(() => {
  mediumZoom('.prose img[data-zoomable]', {
    background: '#000',
    margin: 64,
  })
})
</script>

<template>
  <div style="display: none;"></div>
</template>
