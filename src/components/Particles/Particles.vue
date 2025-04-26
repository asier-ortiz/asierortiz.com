<template>
  <div id="page-particles" class="fixed inset-0 -z-10"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { tsParticles } from 'tsparticles-engine';
import { loadStarsPreset } from 'tsparticles-preset-stars';

let container = null;

async function initParticles() {
  await loadStarsPreset(tsParticles);

  container = await tsParticles.load('page-particles', {
    preset: 'stars',
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    style: {
      position: 'fixed',
      inset: '0',
      zIndex: -10,
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
    if (document.hidden) container.pause();
    else container.play();
  });
}

async function destroyParticles() {
  if (container) {
    await container.destroy();
    container = null;
  }
}

let resizeHandler;

onMounted(() => {
  const checkScreenAndManageParticles = async () => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

    if (isDesktop && !container) {
      await initParticles();
    } else if (!isDesktop && container) {
      await destroyParticles();
    }
  };

  checkScreenAndManageParticles();

  resizeHandler = () => checkScreenAndManageParticles();
  window.addEventListener('resize', resizeHandler);
});

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
  }
  destroyParticles();
});
</script>

<style scoped lang="scss">
#page-particles,
#page-particles canvas {
  position: fixed;
  inset: 0;
  background: transparent !important;
  z-index: -10 !important;
  pointer-events: none;
}

@media (max-width: 767px) {
  #page-particles,
  #page-particles canvas {
    display: none;
  }
}
</style>
