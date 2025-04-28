<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Search from '@components/Icons/Search.vue';

const props = defineProps({
  posts: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close']);

const searchQuery = ref('');
const selectedIndex = ref(-1);

// References
const searchInput = ref(null);

// Compute filtered posts based on search query
const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) return [];
  return props.posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Reset search input and selected index
const resetSearch = () => {
  searchQuery.value = '';
  selectedIndex.value = -1;
};

// Close modal when clicking outside the modal content
const handleBackgroundClick = (event) => {
  if (event.target === event.currentTarget) {
    resetSearch();
    emit('close');
  }
};

// Handle keyboard navigation inside the input
const handleKeyDown = (event) => {
  if (filteredPosts.value.length === 0) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (selectedIndex.value === -1) {
      selectedIndex.value = 0;
    } else {
      selectedIndex.value = (selectedIndex.value + 1) % filteredPosts.value.length;
    }
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (selectedIndex.value === -1) {
      selectedIndex.value = filteredPosts.value.length - 1;
    } else {
      selectedIndex.value = (selectedIndex.value - 1 + filteredPosts.value.length) % filteredPosts.value.length;
    }
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    if (filteredPosts.value.length > 0 && selectedIndex.value !== -1) {
      window.location.href = filteredPosts.value[selectedIndex.value].url;
    }
  }
};

// Handle Escape globally to close the modal
const handleGlobalKeyDown = (event) => {
  if (event.key === 'Escape') {
    resetSearch();
    emit('close');
  }
};

// Focus input and scroll to top when mounted
onMounted(() => {
  nextTick(() => {
    searchInput.value?.focus();
    const container = document.getElementById('results-container');
    container?.scrollTo({ top: 0, behavior: 'auto' });
  });

  window.addEventListener('keydown', handleGlobalKeyDown);
});

// Cleanup global Escape listener when unmounted
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});

// Auto-scroll the selected result into view
watch(selectedIndex, (newIndex) => {
  if (newIndex !== -1) {
    nextTick(() => {
      const selected = document.querySelector('a[data-selected="true"]');
      selected?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade"
    @click="handleBackgroundClick"
    role="dialog"
    aria-modal="true"
    aria-labelledby="search-modal-title"
    aria-describedby="search-modal-desc"
  >
    <div class="bg-base-900 p-8 rounded-2xl w-full max-w-lg relative transform animate-zoom">
      <div class="relative">
        <!-- Hidden heading for accessibility -->
        <h2 id="search-modal-title" class="sr-only">Search posts</h2>
        <p id="search-modal-desc" class="sr-only">Start typing to search and navigate results using arrow keys.</p>

        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-400" />

        <input
          ref="searchInput"
          v-model="searchQuery"
          @keydown="handleKeyDown"
          type="text"
          placeholder="Search posts..."
          class="w-full pl-10 p-3 rounded-lg bg-base-800 text-white placeholder-base-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div id="results-container" class="mt-6 space-y-4 max-h-[300px] overflow-y-auto">
        <p v-if="!searchQuery" class="text-center text-base-400 text-sm">
          Start typing to search...
        </p>
        <p v-else-if="filteredPosts.length === 0" class="text-center text-base-400 text-sm">
          No results found.
        </p>
        <div v-else>
          <a
            v-for="(post, index) in filteredPosts"
            :key="post.url"
            :href="post.url"
            :data-selected="selectedIndex !== -1 && index === selectedIndex ? 'true' : 'false'"
            :class="[
              'block p-3 bg-base-800 rounded-lg transition-colors duration-200',
              {
                'bg-primary-500 text-white': selectedIndex !== -1 && index === selectedIndex,
                'hover:bg-primary-500': !(selectedIndex !== -1 && index === selectedIndex)
              }
            ]"
          >
            {{ post.title }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
