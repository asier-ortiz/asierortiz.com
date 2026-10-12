<template>
  <div id="page-particles" class="fixed inset-0 -z-10"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { isSkySettled, onSkySettle } from './sky-entrance.js';

let container = null;
let motionQuery = null;
let opQueue = Promise.resolve();

// Still under reduced motion or once the sky's entrance is over (sky-entrance.js): the loop is
// paused, so nothing repaints the canvas on its own.
function isStill() {
  return motionQuery.matches || isSkySettled();
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
    // manual pause (reduced motion, the end of the entrance); the canvas is
    // viewport-fixed, so the option provides no value here anyway.
    pauseOnOutsideViewport: false,
    style: {
      position: 'fixed',
      inset: '0',
      // The large viewport, as if the browser's toolbars were hidden: phones and tablets slide
      // them in and out as the page scrolls, and a canvas that followed them would be resized,
      // and so cleared, every time.
      height: '100lvh',
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
let removeSettleHandler;
let resizeWatch = null;
let restFrame = null;

// Brings the stars to rest over `duration` ms instead of freezing them mid-step. The engine's own
// loop stops, and the frames left are drawn here with time running ever slower, so the drift and
// the twinkle ease out together.
function easeToRest(loaded, duration) {
  loaded.pause();
  if (!duration) return;
  const start = performance.now();
  let last = start;
  const step = async (now) => {
    if (container !== loaded) return;
    const t = Math.min(1, (now - start) / duration);
    // Speed goes from full to none along 1 - smoothstep: no jolt where the slowing starts or ends.
    const elapsed = (now - last) * (1 - t * t * (3 - 2 * t));
    last = now;
    await loaded.particles.draw({ value: elapsed, factor: (60 * elapsed) / 1000 });
    if (t < 1) restFrame = requestAnimationFrame(step);
  };
  restFrame = requestAnimationFrame(step);
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  enqueue(manageParticles);

  resizeHandler = () => enqueue(manageParticles);
  window.addEventListener('resize', resizeHandler);

  // Resizing a canvas clears it, and while the sky is still nothing else would draw it again.
  // Redraw as soon as the engine resizes it (half a second after the last change, on its own
  // timer): the stars are back before the next frame is painted.
  resizeWatch = new MutationObserver(() => {
    if (container && isStill()) container.draw(true);
  });
  resizeWatch.observe(document.getElementById('page-particles'), {
    attributeFilter: ['width', 'height'],
    subtree: true,
  });

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
    if (document.hidden) {
      // Frames stop while hidden; resuming the slowdown later would jump the stars forward.
      cancelAnimationFrame(restFrame);
      container.pause();
    } else if (!isStill()) {
      container.play();
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);

  // The entrance ends once and for all: the stars come to rest where they are, and nothing above
  // resumes the loop afterwards.
  removeSettleHandler = onSkySettle((restMs) => {
    if (container) easeToRest(container, motionQuery.matches ? 0 : restMs);
  });
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
  removeSettleHandler?.();
  resizeWatch?.disconnect();
  cancelAnimationFrame(restFrame);
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
