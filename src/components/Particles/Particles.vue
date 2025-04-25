<template>
  <div id="hero-particles" class="absolute inset-0"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { tsParticles } from 'tsparticles-engine';
import { loadStarsPreset } from 'tsparticles-preset-stars';

onMounted(async () => {
  await loadStarsPreset(tsParticles);

  const container = await tsParticles.load('hero-particles', {
    preset: 'stars',
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    style: {
      position: 'absolute',
      inset: '0',
      zIndex: 0,
    },
    particles: {
      color: {
        value: ["#ffffff", "#93c5fd", "#d1d5db", "#fef9c3"],
      },
      number: {
        value: 30,
      },
      size: {
        value: { min: 1, max: 1.5 },
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "top",
        straight: false,
        outModes: {
          default: "out",
        },
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.3,
          sync: false,
        },
      },
    },
  });

  document.addEventListener('visibilitychange', () => {
    if (!container) return;

    if (document.hidden) {
      container.pause();
    } else {
      container.play();
    }
  });
});
</script>

<style scoped>
#hero-particles,
#hero-particles canvas {
  z-index: 0 !important;
  background: transparent !important;
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
