<script setup>
import { onMounted } from 'vue'
import mediumZoom from 'medium-zoom'

const MARGIN = 64
// medium-zoom fits a figure in the window minus the margins, which on a phone is smaller than the
// figure already is (262px against 342px at 390px wide). Figures zoom only where they gain this much.
const MIN_SCALE = 1.2

onMounted(() => {
  const zoom = mediumZoom({ background: '#000', margin: MARGIN })
  const figures = [...document.querySelectorAll('.prose img[data-zoomable]')]

  // medium-zoom only listens for clicks; a zoomable figure also opens with Enter or Space.
  // Escape closes, as it already does.
  const openWithKeyboard = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      zoom.open({ target: event.currentTarget })
    }
  }

  // The scale medium-zoom would give an SVG: as large as the window minus the margins allows.
  const scaleOf = (img) => {
    const { width, height } = img.getBoundingClientRect()
    const { clientWidth, clientHeight } = document.documentElement
    return Math.min((clientWidth - 2 * MARGIN) / width, (clientHeight - 2 * MARGIN) / height)
  }

  const update = () => {
    for (const img of figures) {
      const zoomable = scaleOf(img) >= MIN_SCALE
      if (zoomable === zoom.getImages().includes(img)) continue
      if (zoomable) {
        zoom.attach(img)
        img.setAttribute('tabindex', '0')
        img.setAttribute('role', 'button')
        img.setAttribute('aria-label', `Enlarge: ${img.alt}`)
        img.addEventListener('keydown', openWithKeyboard)
      } else {
        zoom.detach(img)
        img.removeAttribute('tabindex')
        img.removeAttribute('role')
        img.removeAttribute('aria-label')
        img.removeEventListener('keydown', openWithKeyboard)
      }
    }
  }

  update()
  // Rotating the phone or resizing the window changes the answer, and so can a return from the
  // back-forward cache after either.
  window.addEventListener('resize', update)
  window.addEventListener('pageshow', (event) => event.persisted && update())
})
</script>

<template>
  <div style="display: none;"></div>
</template>

<style>
/* medium-zoom removes the enlarged copy on transitionend, so reduced motion shortens its
   transitions instead of removing them. The extra class outranks its injected !important rule. */
@media (prefers-reduced-motion: reduce) {
  .medium-zoom-image.medium-zoom-image--opened,
  .medium-zoom-overlay {
    transition-duration: 1ms !important;
  }
}
</style>
