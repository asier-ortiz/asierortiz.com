<template>
  <div id="page-particles" class="fixed inset-0 -z-10"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { tsParticles } from 'tsparticles-engine';
import { loadStarsPreset } from 'tsparticles-preset-stars';

let container = null;
let motionQuery = null;
let opQueue = Promise.resolve();

// Serializes init/destroy: resize bursts and reduced-motion toggles would
// otherwise interleave with an in-flight load (double containers for the same
// id, or a sub-768px crossing during init leaving a hidden loop running).
function enqueue(op) {
  opQueue = opQueue.then(op, op);
  return opQueue;
}

async function initParticles(reducedMotion) {
  await loadStarsPreset(tsParticles);

  const loaded = await tsParticles.load('page-particles', {
    preset: 'stars',
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    // Under reduced motion the engine's IntersectionObserver must not call
    // play() and undo the manual pause below; the canvas is viewport-fixed,
    // so the option provides no value here anyway.
    pauseOnOutsideViewport: !reducedMotion,
    style: {
      position: 'fixed',
      inset: '0',
      zIndex: -10,
    },
    particles: {
      color: {
        value: ['#ffffff', '#93c5fd', '#d1d5db', '#fef9c3'],
      },
      number: {
        value: 30,
      },
      size: {
        value: { min: 1, max: 1.5 },
      },
      move: {
        enable: !reducedMotion,
        speed: 0.5,
        direction: 'top',
        straight: false,
        outModes: {
          default: 'out',
        },
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: {
          enable: !reducedMotion,
          speed: 0.5,
          minimumValue: 0.3,
          sync: false,
        },
      },
    },
  });

  container = loaded;

  if (reducedMotion && loaded) {
    // The engine only paints inside requestAnimationFrame callbacks, and
    // pause() cancels the pending frame. Wait two frames so the stars are
    // drawn at least once, then freeze the loop (zero CPU afterwards). The
    // instance is captured: a stale callback after a quick preference toggle
    // must not pause (or blank) the replacement container.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (container === loaded) loaded.pause();
      });
    });
  }
}

async function destroyParticles() {
  if (container) {
    await container.destroy();
    container = null;
  }
}

async function manageParticles() {
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;

  if (isDesktop && !container) {
    await initParticles(motionQuery.matches);
  } else if (!isDesktop && container) {
    await destroyParticles();
  }
}

let resizeHandler;
let motionChangeHandler;
let visibilityHandler;
let frozenRepaintTimer = null;

// A window resize clears the canvas bitmap, and the engine repaints it only
// from its animation loop — which is paused under reduced motion. Repaint one
// frame after the engine's own debounced resize (0.5s default) has settled.
function scheduleFrozenRepaint() {
  if (frozenRepaintTimer) clearTimeout(frozenRepaintTimer);
  frozenRepaintTimer = setTimeout(() => {
    frozenRepaintTimer = null;
    if (container && motionQuery.matches) container.draw(true);
  }, 700);
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  enqueue(manageParticles);

  resizeHandler = () => {
    enqueue(manageParticles);
    if (motionQuery.matches) scheduleFrozenRepaint();
  };
  window.addEventListener('resize', resizeHandler);

  // Live OS toggle: rebuild with the config matching the new preference.
  motionChangeHandler = () => {
    enqueue(async () => {
      await destroyParticles();
      await manageParticles();
    });
  };
  motionQuery.addEventListener('change', motionChangeHandler);

  // Registered once, not per init: a stale closure would otherwise play() a
  // frozen container after a live reduced-motion re-init.
  visibilityHandler = () => {
    if (!container) return;
    if (document.hidden) container.pause();
    else if (!motionQuery.matches) container.play();
  };
  document.addEventListener('visibilitychange', visibilityHandler);
});

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
  }
  if (motionQuery && motionChangeHandler) {
    motionQuery.removeEventListener('change', motionChangeHandler);
  }
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
  }
  if (frozenRepaintTimer) {
    clearTimeout(frozenRepaintTimer);
  }
  // Through the queue so an in-flight init is destroyed, not orphaned.
  enqueue(destroyParticles);
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
