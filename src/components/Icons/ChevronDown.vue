<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="class"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
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
