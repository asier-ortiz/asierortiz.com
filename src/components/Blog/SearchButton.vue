<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import SearchModal from '@components/Blog/SearchModal.vue';
import Search from '@components/Icons/Search.vue';


const props = defineProps({
  posts: {
    type: Array,
    required: true
  }
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

// Detect if the user is on a Mac device
const isMac = ref(false);

onMounted(() => {
  isMac.value = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
});

// Only display the search button if there are posts available
const hasPosts = computed(() => props.posts.length > 0);
</script>

<template>
  <div v-if="hasPosts" class="relative group">
    <button
      type="button"
      @click="openModal"
      class="filter-btn bg-primary-500 hover:bg-primary-400 text-xs text-white font-medium py-1 px-3 rounded-full transition flex items-center gap-2 relative"
      aria-label="Search Articles"
    >
      <Search class="h-4 w-4" />

      <span class="hidden sm:inline">Search</span>

      <!-- Keyboard shortcut displayed next to "Search" on desktop -->
      <span class="hidden sm:inline opacity-70 text-[0.65rem]">
        ({{ isMac ? 'Cmd + K' : 'Ctrl + K' }})
      </span>

      <!-- Tooltip displayed on mobile when hovering the button -->
      <div
        class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-base-700 text-white text-[0.65rem] font-medium px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-90 transition-opacity duration-300 delay-150 pointer-events-none whitespace-nowrap text-center max-w-xs break-words block sm:hidden"
      >
        {{ isMac ? 'Cmd + K' : 'Ctrl + K' }}
      </div>
    </button>

    <SearchModal v-if="isOpen" :posts="posts" @close="closeModal" />
  </div>
</template>
