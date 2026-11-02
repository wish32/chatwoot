<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  startIndex: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close']);

const index = ref(
  Math.min(Math.max(props.startIndex, 0), Math.max(props.items.length - 1, 0))
);

const current = computed(() => props.items[index.value] || null);
const hasMany = computed(() => props.items.length > 1);

const showPrevious = () => {
  if (index.value > 0) index.value -= 1;
};

const showNext = () => {
  if (index.value < props.items.length - 1) index.value += 1;
};

const onKeydown = event => {
  if (event.key === 'Escape') emit('close');
  if (event.key === 'ArrowLeft') showPrevious();
  if (event.key === 'ArrowRight') showNext();
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div
    class="fixed inset-0 z-[80] flex items-center justify-center bg-[#1c1c21]/95 text-zinc-100"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div class="absolute top-3 end-3 z-10 flex items-center gap-2">
      <button
        type="button"
        class="flex items-center justify-center size-9 rounded-full border-0 bg-white/15 text-zinc-100 cursor-pointer hover:bg-white/25"
        :aria-label="$t('COMPONENTS.MEDIA_VIEWER.CLOSE')"
        @click="emit('close')"
      >
        <FluentIcon icon="dismiss" size="20" />
      </button>
    </div>

    <button
      v-if="hasMany"
      type="button"
      class="absolute start-2 flex items-center justify-center size-9 rounded-full border-0 bg-white/15 text-zinc-100 cursor-pointer hover:bg-white/25 disabled:opacity-35 disabled:cursor-default"
      :disabled="index === 0"
      :aria-label="$t('COMPONENTS.MEDIA_VIEWER.PREVIOUS')"
      @click.stop="showPrevious"
    >
      <FluentIcon icon="chevron-left" size="22" />
    </button>

    <div class="flex items-center justify-center w-[calc(100%-6rem)] h-[calc(100%-7.5rem)]">
      <img
        v-if="current"
        :key="current.id || current.data_url"
        :src="current.data_url"
        alt=""
        class="max-w-full max-h-full object-contain"
      />
    </div>

    <button
      v-if="hasMany"
      type="button"
      class="absolute end-2 flex items-center justify-center size-9 rounded-full border-0 bg-white/15 text-zinc-100 cursor-pointer hover:bg-white/25 disabled:opacity-35 disabled:cursor-default"
      :disabled="index === items.length - 1"
      :aria-label="$t('COMPONENTS.MEDIA_VIEWER.NEXT')"
      @click.stop="showNext"
    >
      <FluentIcon icon="chevron-right" size="22" />
    </button>

    <div
      v-if="hasMany"
      class="absolute bottom-3 inset-x-3 flex justify-center gap-1.5 overflow-x-auto"
    >
      <button
        v-for="(item, itemIndex) in items"
        :key="item.id || item.data_url"
        type="button"
        class="shrink-0 size-12 p-0 overflow-hidden rounded-md border-2 bg-[#2a2a31] cursor-pointer"
        :class="itemIndex === index ? 'border-zinc-100' : 'border-transparent'"
        @click.stop="index = itemIndex"
      >
        <img
          :src="item.thumb_url || item.data_url"
          alt=""
          class="size-full object-cover"
        />
      </button>
    </div>
  </div>
</template>
