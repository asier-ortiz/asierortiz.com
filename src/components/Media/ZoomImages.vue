<script setup>
import { onMounted } from 'vue'
import mediumZoom from 'medium-zoom'

onMounted(() => {
  const zoom = mediumZoom('.prose img[data-zoomable]', {
    background: '#000',
    margin: 64,
  })

  // medium-zoom only listens for clicks; make each figure focusable and open it with the
  // keyboard as well. Escape closes, as it already does.
  for (const img of document.querySelectorAll('.prose img[data-zoomable]')) {
    img.setAttribute('tabindex', '0')
    img.setAttribute('role', 'button')
    img.setAttribute('aria-label', `Enlarge: ${img.alt}`)
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        zoom.open({ target: img })
      }
    })
  }
})
</script>

<template>
  <div style="display: none;"></div>
</template>
