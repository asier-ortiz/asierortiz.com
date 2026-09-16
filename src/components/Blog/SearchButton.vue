<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import SearchModal from '@components/Blog/SearchModal.vue';
import Search from '@components/Icons/Search.vue';

const props = defineProps({
  posts: Array,
  language: {
    type: String,
    default: 'en-US',
  },
});

const isOpen = ref(false);

// Open the search modal
const openModal = () => {
  isOpen.value = true;
};

// Close the search modal
const closeModal = () => {
  isOpen.value = false;
};

// Global keyboard shortcut (Ctrl+K / Cmd+K) to open the modal
const handleGlobalShortcut = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalShortcut);
});

// The shortcut hint depends on the platform, which only the browser knows. The button is
// server-rendered, so the hint is kept invisible (but sized) until mount, then filled in;
// nothing shifts and nothing shows the wrong key first.
const mounted = ref(false);
const isMac = ref(false);

onMounted(() => {
  isMac.value = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
  mounted.value = true;
});

// Only display the search button if there are posts available
const hasPosts = computed(() => props.posts.length > 0);
</script>

<template>
  <div v-if="hasPosts" class="relative group">
    <button
      type="button"
      @click="openModal"
      class="filter-btn bg-primary-500 hover:bg-primary-400 text-xs text-black font-medium py-1 px-3 rounded-full transition flex items-center gap-2 relative"
      :aria-label="mounted ? `Search posts (${isMac ? 'Command + K' : 'Control + K'})` : 'Search posts'"
    >
      <Search class="h-4 w-4" />

      <span class="hidden sm:inline">Search</span>

      <!-- Key labels are written without surrounding whitespace: the HTML minifier would
           collapse it in the served markup, and Vue would then flag a hydration mismatch. -->
      <span
        class="hidden sm:flex items-center gap-1 opacity-70 text-[0.65rem] min-w-[3.25rem]"
        :class="{ invisible: !mounted }"
        aria-hidden="true"
      >
        <span class="key">{{ isMac ? '⌘' : 'Ctrl' }}</span>
        <span class="key">K</span>
      </span>
    </button>

    <SearchModal v-if="isOpen" :posts="posts" :language="language" @close="closeModal" />
  </div>
</template>

<style scoped>
.key {
  @apply rounded border border-white/30 bg-zinc-700 px-1.5 py-0.5 font-mono text-xs leading-none text-white;
}
</style>
