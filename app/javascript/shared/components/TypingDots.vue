<script setup>
defineProps({
  size: {
    type: String,
    default: 'sm',
    validator: value => ['sm', 'md'].includes(value),
  },
});
</script>

<template>
  <span class="inline-flex items-center gap-0.5" aria-hidden="true">
    <span
      class="rounded-full bg-current motion-safe:animate-bounce"
      :class="size === 'md' ? 'size-1.5' : 'size-1'"
    />
    <span
      class="rounded-full bg-current motion-safe:animate-bounce [animation-delay:150ms]"
      :class="size === 'md' ? 'size-1.5' : 'size-1'"
    />
    <span
      class="rounded-full bg-current motion-safe:animate-bounce [animation-delay:300ms]"
      :class="size === 'md' ? 'size-1.5' : 'size-1'"
    />
  </span>
</template>
