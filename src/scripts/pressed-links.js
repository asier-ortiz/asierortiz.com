// Marks the tapped link with data-pressed until the next page replaces this one, so a tap is
// acknowledged during the wait. Components style the attribute; :active cannot do this job, as
// both engines apply it to a finger resting on a card before a scroll.
let pressed;
let releaseTimer;

// Back to rest at once; the components' own transitions would fade the pressed look out.
const release = () => {
  clearTimeout(releaseTimer);
  pressed?.removeAttribute('data-pressed');
  pressed?.getAnimations({ subtree: true }).forEach((animation) => {
    if (animation instanceof CSSTransition) animation.finish();
  });
};

// Bubble phase: handlers that take a link over (chips, Back to all posts) cancel it first.
document.addEventListener('click', (event) => {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  if (!(link instanceof HTMLAnchorElement) || event.defaultPrevented) return;
  if (event.button !== 0 || modified || link.hasAttribute('download')) return;
  if (link.target && link.target !== '_self') return;
  // Other origins (mailto: included) and jumps within this page keep the browser's handling.
  const url = new URL(link.href);
  const samePage = url.pathname === location.pathname && url.search === location.search;
  if (url.origin !== location.origin || (url.hash && samePage)) return;

  release();
  pressed = link;
  link.setAttribute('data-pressed', '');
  // iOS Safari paints nothing once a navigation starts, so leave after the pressed frame.
  event.preventDefault();
  requestAnimationFrame(() => setTimeout(() => location.assign(link.href), 0));
  // A load the reader cancels never fires pagehide.
  releaseTimer = setTimeout(release, 10_000);
});

// pagehide comes after the view-transition snapshot: the cross-fade keeps the pressed look, the
// page kept for Back does not. pageshow repeats it for engines that restyle on restore.
window.addEventListener('pagehide', release);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) release();
});

// iOS applies :active only while a touch listener exists. Astro's prefetch script adds one today;
// this one keeps the active: styles from depending on it.
document.body.addEventListener('touchstart', () => {}, { passive: true });
