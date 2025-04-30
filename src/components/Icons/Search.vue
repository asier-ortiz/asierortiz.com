<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="class"
    fill="none"
    viewBox="2 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z"
    />
  </svg>
</template>

<script setup>
defineProps({
  class: {
    type: String,
    default: ''
  }
});
</script>
