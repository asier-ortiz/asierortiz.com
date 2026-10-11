// The starry background moves only as an entrance. A visit that arrives from somewhere else (a
// search, a link, a typed address) sees the star field (Particles.vue) drift and one shooting
// star (ShootingStar.astro) cross it, and then the whole sky slows to rest for good. Motion that
// stops within five seconds needs no control to pause it (WCAG 2.2.2). Pages reached from inside
// the site, or through Back and Forward, start still. Imported by Particles.vue only, so it loads
// where the sky is drawn and nowhere else.

// Counted from the moment anything in the sky can move: under five seconds, with room for a
// timer that fires late on a busy page.
const ENTRANCE_MS = 4800;
// The last stretch of it, in which the stars slow down to rest instead of stopping dead.
const SETTLE_MS = 1800;
// The page's own entrance (0.6s) is over by then, and the star (0.8s) is gone before the sky
// starts to slow.
const SHOOTING_STAR_AT_MS = 2000;

let settled = true;
let started = false;
let timers = [];
const settleCallbacks = new Set();

function arrivedFromOutside() {
  const [navigation] = performance.getEntriesByType('navigation');
  if (navigation?.type === 'back_forward') return false;
  try {
    return new URL(document.referrer).origin !== location.origin;
  } catch {
    // No referrer: a typed address, a bookmark, or a site that withholds it.
    return true;
  }
}

function launchShootingStar() {
  const layer = document.getElementById('shooting-stars-container');
  if (
    !layer ||
    window.innerWidth < 768 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const star = document.createElement('div');
  star.className = 'shooting-star';
  const angle = -(25 + Math.random() * 20);
  star.style.setProperty('--angle', angle + 'deg');
  // From a fifth of the way down: any higher, the fixed header hides it or it climbs out of the
  // window before it fades.
  star.style.top = 20 + Math.random() * 30 + '%';
  star.style.left = Math.random() * 70 + '%';

  layer.appendChild(star);

  star.addEventListener('animationend', () => star.remove());

  // A reduced-motion toggle mid-flight cancels the animation instead of ending it.
  star.addEventListener('animationcancel', () => star.remove());
}

function settle(restMs) {
  settled = true;
  timers.forEach(clearTimeout);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  // Leaving the page mid-entrance ends it early: a star in flight stops with the rest.
  const layer = document.getElementById('shooting-stars-container');
  if (layer) layer.textContent = '';
  settleCallbacks.forEach((callback) => callback(restMs));
}

function begin() {
  started = true;
  timers = [
    setTimeout(launchShootingStar, SHOOTING_STAR_AT_MS),
    setTimeout(() => settle(SETTLE_MS), ENTRANCE_MS - SETTLE_MS),
  ];
}

// The clock starts when the page is first on screen, so a tab opened in the background keeps its
// entrance for later. Leaving the page mid-entrance (another tab, a link) ends it there.
function onVisibilityChange() {
  if (document.hidden) {
    if (started) settle(0);
  } else if (!started) {
    begin();
  }
}

// Particles.vue also renders on the server, where no visit arrives.
if (typeof document !== 'undefined' && arrivedFromOutside()) {
  settled = false;
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (!document.hidden) begin();
}

/** Whether the entrance is over, or this page never had one: nothing sets the sky moving again. */
export const isSkySettled = () => settled;

/**
 * Runs `callback(restMs)` when the entrance ends (never on a page that starts still), with the
 * time the stars take to come to rest: none when the page is left mid-entrance. Returns an undo.
 */
export function onSkySettle(callback) {
  settleCallbacks.add(callback);
  return () => settleCallbacks.delete(callback);
}
