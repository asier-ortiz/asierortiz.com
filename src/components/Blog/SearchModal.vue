<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Search from '@components/Icons/Search.vue';
import { formatDate } from '@utils/formatDate';
import { useScrollLock } from '@composables/useScrollLock';
import Fuse from 'fuse.js';

const props = defineProps({
  posts: {
    type: Array,
    required: true,
  },
  language: {
    type: String,
    default: 'en-US',
  },
});

const emit = defineEmits(['close']);

const searchQuery = ref('');
const selectedIndex = ref(-1);
const isClosing = ref(false);
const fuse = ref(null);
const normalizedPosts = ref([]);

const searchInput = ref(null);

useScrollLock();

onMounted(() => {
  normalizedPosts.value = props.posts.map((post) => ({
    title: post.title || 'Untitled Post',
    description: post.description || '',
    url: post.url || '#',
    pubDate: post.pubDate || null,
  }));

  fuse.value = new Fuse(normalizedPosts.value, {
    keys: ['title', 'description'],
    threshold: 0.4,
    includeMatches: true,
    minMatchCharLength: 1,
  });

  nextTick(() => {
    searchInput.value?.focus();
    const container = document.getElementById('results-container');
    container?.scrollTo({ top: 0, behavior: 'auto' });
  });

  window.addEventListener('keydown', handleGlobalKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});

const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) return [];
  const result = fuse.value.search(searchQuery.value);
  return result.map((res) => ({
    ...res.item,
    matches: res.matches,
  }));
});

const resetSearch = () => {
  isClosing.value = true;
  setTimeout(() => {
    searchQuery.value = '';
    selectedIndex.value = -1;
    isClosing.value = false;
    emit('close');
  }, 200);
};

const handleBackgroundClick = (event) => {
  if (event.target === event.currentTarget) {
    resetSearch();
  }
};

const handleKeyDown = (event) => {
  if (filteredPosts.value.length === 0) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedIndex.value =
      selectedIndex.value === -1 ? 0 : (selectedIndex.value + 1) % filteredPosts.value.length;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedIndex.value =
      selectedIndex.value === -1
        ? filteredPosts.value.length - 1
        : (selectedIndex.value - 1 + filteredPosts.value.length) % filteredPosts.value.length;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    if (filteredPosts.value.length > 0 && selectedIndex.value !== -1) {
      window.location.href = filteredPosts.value[selectedIndex.value].url;
    }
  }
};

const handleGlobalKeyDown = (event) => {
  if (event.key === 'Escape') {
    resetSearch();
  }
};

watch(selectedIndex, (newIndex) => {
  if (newIndex !== -1) {
    nextTick(() => {
      const selected = document.querySelector('a[data-selected="true"]');
      if (selected) {
        const container = document.getElementById('results-container');
        const containerRect = container.getBoundingClientRect();
        const selectedRect = selected.getBoundingClientRect();

        if (selectedRect.top < containerRect.top || selectedRect.bottom > containerRect.bottom) {
          selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    });
  }
});

watch(searchQuery, () => {
  selectedIndex.value = -1;
});

const highlightMatch = (post, field) => {
  if (!post.matches) return post[field];

  const match = post.matches.find((m) => m.key === field);
  if (!match) return post[field];

  let text = post[field];
  const minHighlightLength = 30;
  const contextChars = 30;

  if (field === 'description' && match.indices.length > 0) {
    const [start, end] = match.indices[0];
    const matchLength = end - start + 1;

    if (matchLength < minHighlightLength) {
      const startContext = Math.max(start - contextChars, 0);
      const endContext = Math.min(end + 1 + contextChars, text.length);
      text = text.slice(startContext, endContext);

      match.indices = [[start - startContext, end - startContext]];
    }
  }

  let result = '';
  let lastIndex = 0;

  match.indices.forEach(([start, end]) => {
    result += text.slice(lastIndex, start);
    result += `<mark>${text.slice(start, end + 1)}</mark>`;
    lastIndex = end + 1;
  });

  result += text.slice(lastIndex);

  return field === 'description' ? `...${result}...` : result;
};
</script>

<template>

  <div
    class="fixed inset-0 z-50 flex justify-center transition-opacity duration-200"
    :class="isClosing ? 'opacity-0' : 'opacity-100'"
    style="background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px)"
    @click="handleBackgroundClick"
    role="dialog"
    aria-modal="true"
    aria-labelledby="search-modal-title"
    aria-describedby="search-modal-desc"
  >

    <div
      class="bg-base-900 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-xl transition-all duration-300 absolute top-[10vh]"
    >
      <div class="px-6 pt-6 sticky top-0 bg-base-900 z-10">
        <div class="relative search-input">
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
      </div>

      <div
        id="results-container"
        class="overflow-y-auto hide-scrollbar px-6 py-4 mt-4 transition-all duration-200"
        :class="[
          filteredPosts.length > 0
          ? 'space-y-4 max-h-[300px]'
          : 'flex items-center justify-center h-[100px]'
        ]"
      >
        <p v-if="!searchQuery" class="text-center text-base-400 text-sm">
          Start typing to search...
        </p>
        <p v-else-if="filteredPosts.length === 0" class="text-center text-base-400 text-sm">
          No results found.
        </p>
        <template v-else>
          <a
            v-for="(post, index) in filteredPosts"
            :key="post.url"
            :href="post.url"
            :data-selected="selectedIndex !== -1 && index === selectedIndex ? 'true' : 'false'"
            :class="[
            'block p-3 bg-base-800 rounded-lg transition-colors duration-200 ease-in-out',
            {
              'bg-primary-600 text-white': selectedIndex !== -1 && index === selectedIndex,
              'hover:bg-primary-700 hover:text-white': !(
                selectedIndex !== -1 && index === selectedIndex
              ),
            },
          ]"
          >
            <div>
              <strong v-html="highlightMatch(post, 'title')"></strong>
              <p class="text-base-400 text-sm mt-1" v-html="highlightMatch(post, 'description')"></p>
              <p v-if="post.pubDate" class="text-base-500 text-xs mt-1">
                {{ formatDate(post.pubDate, props.language) }}
              </p>
            </div>
          </a>
        </template>
      </div>
    </div>
  </div>
</template>
