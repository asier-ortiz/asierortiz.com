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
const dialog = ref(null);

useScrollLock();

// Behind the open dialog the page is inert, as behind a native modal <dialog>: Tab, clicks and
// screen readers stay in the dialog (WCAG 2.4.3). Teleported, the dialog is one of body's own
// children, so the others are the page. Safari before 15.5 ignores inert and lets Tab out.
let inertPage = [];

onMounted(() => {
  inertPage = [...document.body.children].filter((el) => el !== dialog.value && !el.inert);
  inertPage.forEach((el) => (el.inert = true));
});

onBeforeUnmount(() => {
  inertPage.forEach((el) => (el.inert = false));
});

onMounted(() => {
  normalizedPosts.value = props.posts.map((post) => ({
    title: post.title || 'Untitled Post',
    description: post.description || '',
    url: post.url || '#',
    tags: post.tags || [],
    pubDate: post.pubDate || null,
  }));

  fuse.value = new Fuse(normalizedPosts.value, {
    keys: ['title', 'description', 'tags'],
    // Fuse scores a hit by how far into the field it sits unless this is off, so at 0.4 only the
    // first ~40 characters of a field could match: "data" missed a title ending in "River Sensor
    // Data". Without that accidental filter the threshold carries the noise alone, and at 0.3 a
    // short query stays exact while a typo in a longer one is still forgiven.
    ignoreLocation: true,
    threshold: 0.3,
  });

  nextTick(() => {
    searchInput.value?.focus();
    const container = document.getElementById('results-container');
    container?.scrollTo({ top: 0, behavior: 'auto' });
  });

  window.addEventListener('keydown', handleGlobalKeyDown);
  window.addEventListener('pageshow', handleRestore);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
  window.removeEventListener('pageshow', handleRestore);
});

// Back from a post restores this page with the modal open, and WebKit then empties an
// autocomplete="off" field while the query and its results stay here: the box would list results
// for a query the reader can no longer see. The frame is needed; the reset lands after pageshow.
const handleRestore = (event) => {
  if (!event.persisted) return;
  requestAnimationFrame(() => {
    if (searchInput.value) searchInput.value.value = searchQuery.value;
  });
};

const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) return [];
  return fuse.value.search(searchQuery.value).map((res) => res.item);
});

// Read by screen readers as the list changes; sighted users see the list itself.
const resultsStatus = computed(() => {
  if (!searchQuery.value.trim()) return '';
  const n = filteredPosts.value.length;
  return n === 0 ? 'No results' : `${n} ${n === 1 ? 'result' : 'results'}`;
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

  // Enter opens the row picked with the arrows, or the best match: phone keyboards have no arrows,
  // only Go. Clicking the row, rather than setting location, makes it behave like a tap on it.
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault();
    document.querySelectorAll('#results-container a')[Math.max(selectedIndex.value, 0)]?.click();
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
      const selected = document.getElementById(`search-result-${newIndex}`);
      if (selected) {
        const container = document.getElementById('results-container');
        const containerRect = container.getBoundingClientRect();
        const selectedRect = selected.getBoundingClientRect();

        if (selectedRect.top < containerRect.top || selectedRect.bottom > containerRect.bottom) {
          selected.scrollIntoView({
            block: 'nearest',
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'auto'
              : 'smooth',
          });
        }
      }
    });
  }
});

watch(searchQuery, () => {
  selectedIndex.value = -1;
});

// Fuse ranks the rows, the reader's own words make the marks: Fuse's indices are fuzzy (a stray
// "he" out of "The") and cover none of the tags a row can also match on.
const queryPattern = computed(() => {
  const terms = searchQuery.value.trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return null;
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(${escaped.join('|')})`, 'gi');
});

const truncate = (text, limit) => (text.length > limit ? `${text.slice(0, limit)}...` : text);

const highlightTag = (tag) => {
  const pattern = queryPattern.value;
  return pattern ? `#${tag.replace(pattern, '<mark>$1</mark>')}` : `#${tag}`;
};

const highlightMatch = (post, field) => {
  const text = post[field];
  const pattern = queryPattern.value;
  if (!text) return text;

  // A description is a whole paragraph: it is cut to a window around its first hit, or to its
  // opening when the row matched on a tag instead and there is nothing to centre on.
  const windowed = field === 'description';
  const contextChars = 30;
  if (pattern) pattern.lastIndex = 0;
  const hit = pattern?.exec(text);
  if (!hit) return windowed ? truncate(text, 2 * contextChars) : text;

  const start = windowed ? Math.max(hit.index - contextChars, 0) : 0;
  const end = windowed ? Math.min(pattern.lastIndex + contextChars, text.length) : text.length;
  const marked = text.slice(start, end).replace(pattern, '<mark>$1</mark>');

  return `${start > 0 ? '...' : ''}${marked}${end < text.length ? '...' : ''}`;
};
</script>

<template>
  <!-- Rendered at body level: the listing's filter row carries a view-transition-name, which makes it a
       stacking context and backdrop root, and a fixed overlay left inside it stays confined to that box
       in WebKit (blurred chips, no dialog on iPhone). -->
  <Teleport to="body">
  <div
    ref="dialog"
    class="fixed inset-0 z-50 flex justify-center transition-opacity duration-200"
    :class="isClosing ? 'opacity-0' : 'opacity-100'"
    style="background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px)"
    @click="handleBackgroundClick"
    role="dialog"
    aria-modal="true"
    aria-label="Search posts"
  >

    <div
      class="bg-base-900 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-xl transition-all duration-300 absolute top-[10vh]"
    >
      <div class="px-6 pt-6 sticky top-0 bg-base-900 z-10 flex items-center gap-2">
        <div class="relative search-input flex-1">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-400" />
          <!-- Not v-model: it skips input while a word is being composed, and Android keyboards compose
               every word as it is typed, so results would only update after a space. -->
          <!-- A combobox (APG pattern): focus stays here while the arrows pick a row, and
               aria-activedescendant has screen readers announce it (WCAG 4.1.2). -->
          <input
            ref="searchInput"
            :value="searchQuery"
            @input="searchQuery = $event.target.value"
            @keydown="handleKeyDown"
            type="search"
            role="combobox"
            :aria-expanded="filteredPosts.length > 0"
            aria-controls="search-results"
            aria-autocomplete="list"
            :aria-activedescendant="selectedIndex === -1 ? undefined : `search-result-${selectedIndex}`"
            enterkeyhint="go"
            autocomplete="off"
            aria-label="Search posts"
            placeholder="Search posts..."
            class="w-full pl-10 p-3 rounded-lg bg-base-800 text-white placeholder-base-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <!-- On touch there is no Escape key and no cursor to find the backdrop with. -->
        <button
          type="button"
          @click="resetSearch"
          aria-label="Close search"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-base-400 hover:bg-base-800 hover:text-white active:bg-base-800 active:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p class="sr-only" role="status">{{ resultsStatus }}</p>

      <!-- tabindex: Chrome makes a scroller with nothing focusable inside a tab stop of its own, and
           the options below are left out of the Tab order on purpose. The arrows scroll it. -->
      <div
        id="results-container"
        tabindex="-1"
        class="overflow-y-auto px-6 py-4 mt-4 transition-all duration-200"
        :class="[
          filteredPosts.length > 0
          ? 'max-h-[min(300px,50dvh)]'
          : 'flex items-center justify-center h-[100px]'
        ]"
      >
        <p v-if="!searchQuery" class="text-center text-base-400 text-sm">
          Start typing to search...
        </p>
        <p v-else-if="filteredPosts.length === 0" class="text-center text-base-400 text-sm">
          No results found.
        </p>
        <!-- The combobox's options. Out of the Tab order, as the pattern has them: the arrows reach
             them and Enter, a click or a tap opens them. Hidden rather than removed while empty, so
             aria-controls always points at it. -->
        <div
          v-show="filteredPosts.length > 0"
          id="search-results"
          role="listbox"
          aria-label="Search results"
          class="space-y-4"
        >
          <!-- Picked with the arrows, hovered or tapped, a row takes the same primary-700: white reads
               at 5.9:1 on it, 4.1:1 on primary-600. -->
          <a
            v-for="(post, index) in filteredPosts"
            :id="`search-result-${index}`"
            :key="post.url"
            :href="post.url"
            role="option"
            :aria-selected="index === selectedIndex"
            tabindex="-1"
            :class="[
            'block p-3 bg-base-800 rounded-lg transition-colors duration-200 ease-in-out data-[pressed]:bg-primary-700 data-[pressed]:text-white data-[pressed]:duration-0',
            {
              'bg-primary-700 text-white': selectedIndex !== -1 && index === selectedIndex,
              'hover:bg-primary-700 hover:text-white': !(
                selectedIndex !== -1 && index === selectedIndex
              ),
            },
          ]"
          >
            <div>
              <strong v-html="highlightMatch(post, 'title')"></strong>
              <p class="text-base-400 text-sm mt-1" v-html="highlightMatch(post, 'description')"></p>
              <!-- Tags are searched too, so a row that matched on one shows why it is here. -->
              <p class="text-base-400 text-xs mt-1">
                <span v-if="post.pubDate">{{ formatDate(post.pubDate, props.language) }}</span>
                <span v-for="tag in post.tags" :key="tag" class="ml-2" v-html="highlightTag(tag)" />
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>
