<template>
  <div id="page-particles" class="fixed inset-0 -z-10"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

let container = null;
let motionQuery = null;
let pauseSwitch = null;
let opQueue = Promise.resolve();

// Still under reduced motion or while the visitor holds the pause switch (ParticlesPause.astro):
// the loop is paused, so nothing repaints the canvas on its own.
function isStill() {
  return motionQuery.matches || Boolean(pauseSwitch?.checked);
}

// Serializes init/destroy: resize bursts and reduced-motion toggles would
// otherwise interleave with an in-flight load (double containers for the same
// id, or a sub-768px crossing during init leaving a hidden loop running).
function enqueue(op) {
  opQueue = opQueue.then(op, op);
  return opQueue;
}

async function initParticles(reducedMotion) {
  // Loaded here, not at module level: the component now renders on the server (client:media
  // only hydrates it from 768px up) and the tsparticles packages cannot be imported in Node.
  const [{ tsParticles }, { loadStarsPreset }] = await Promise.all([
    import('tsparticles-engine'),
    import('tsparticles-preset-stars'),
  ]);
  await loadStarsPreset(tsParticles);

  const loaded = await tsParticles.load('page-particles', {
    preset: 'stars',
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    // The engine's IntersectionObserver must not call play() and undo a
    // manual pause (reduced motion, the pause switch); the canvas is
    // viewport-fixed, so the option provides no value here anyway.
    pauseOnOutsideViewport: false,
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

  if (isStill() && loaded) {
    // The engine only paints inside requestAnimationFrame callbacks, and
    // pause() cancels the pending frame. Wait two frames so the stars are
    // drawn at least once, then freeze the loop (zero CPU afterwards). The
    // instance is captured: a stale callback after a quick preference toggle
    // must not pause (or blank) the replacement container.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (container === loaded && isStill()) loaded.pause();
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
let pauseHandler;
let frozenRepaintTimer = null;

// A window resize clears the canvas bitmap, and the engine repaints it only
// from its animation loop — which is paused while still. Repaint one frame
// after the engine's own debounced resize (0.5s default) has settled.
function scheduleFrozenRepaint() {
  if (frozenRepaintTimer) clearTimeout(frozenRepaintTimer);
  frozenRepaintTimer = setTimeout(() => {
    frozenRepaintTimer = null;
    if (container && isStill()) container.draw(true);
  }, 700);
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  pauseSwitch = document.getElementById('particles-pause');

  enqueue(manageParticles);

  resizeHandler = () => {
    enqueue(manageParticles);
    if (isStill()) scheduleFrozenRepaint();
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
    else if (!isStill()) container.play();
  };
  document.addEventListener('visibilitychange', visibilityHandler);

  // A pause holds until the visitor lifts it: nothing above resumes the loop while it is on.
  pauseHandler = () => {
    if (!container) return;
    if (pauseSwitch.checked) container.pause();
    else if (!motionQuery.matches && !document.hidden) container.play();
  };
  pauseSwitch?.addEventListener('change', pauseHandler);
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
  if (pauseSwitch && pauseHandler) {
    pauseSwitch.removeEventListener('change', pauseHandler);
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
