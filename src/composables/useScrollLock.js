import { onMounted, onBeforeUnmount } from 'vue';

// Ref. https://vuejs.org/guide/reusability/composables

export function useScrollLock(lock = true) {
  const preventTouch = (e) => e.preventDefault();

  onMounted(() => {
    if (lock) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('touchmove', preventTouch, { passive: false });
    }
  });

  onBeforeUnmount(() => {
    if (lock) {
      document.body.style.overflow = '';
      document.removeEventListener('touchmove', preventTouch);
    }
  });
}
