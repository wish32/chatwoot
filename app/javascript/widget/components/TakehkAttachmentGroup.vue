<script setup>
import { computed, ref } from 'vue';
import FileBubble from 'widget/components/FileBubble.vue';
import VideoBubble from 'widget/components/VideoBubble.vue';
import TakehkMediaViewer from 'widget/components/TakehkMediaViewer.vue';
import { attachmentGridColumns } from 'shared/helpers/takehkAttachmentGrid';

const props = defineProps({
  attachments: {
    type: Array,
    default: () => [],
  },
  widgetColor: {
    type: String,
    default: '',
  },
  isUserBubble: {
    type: Boolean,
    default: false,
  },
  isInProgress: {
    type: Boolean,
    default: false,
  },
  readableTime: {
    type: String,
    default: '',
  },
});

const viewerIndex = ref(null);

const images = computed(() =>
  props.attachments.filter(item => item.file_type === 'image' && item.data_url)
);
const videos = computed(() =>
  props.attachments.filter(item => item.file_type === 'video')
);
const audios = computed(() =>
  props.attachments.filter(item => item.file_type === 'audio')
);
const files = computed(() =>
  props.attachments.filter(
    item => !['image', 'video', 'audio'].includes(item.file_type)
  )
);

const columns = computed(() => attachmentGridColumns(images.value.length));
const gridClass = computed(() => {
  if (columns.value === 1) return 'grid-cols-1';
  if (columns.value === 2) return 'grid-cols-2';
  return 'grid-cols-3';
});
</script>

<template>
  <div
    v-if="images.length"
    class="relative grid gap-0.5 w-64 max-w-full overflow-hidden rounded-lg"
    :class="gridClass"
  >
    <button
      v-for="(image, index) in images"
      :key="image.id || image.data_url"
      type="button"
      class="p-0 border-0 overflow-hidden bg-black/5 cursor-pointer"
      :class="images.length === 1 ? 'aspect-[4/3]' : 'aspect-square'"
      @click="viewerIndex = index"
    >
      <img
        :src="image.thumb_url || image.data_url"
        alt=""
        class="block size-full object-cover"
      />
    </button>
    <span
      v-if="readableTime"
      class="absolute bottom-1 end-1 px-1 text-[11px] leading-4 text-white bg-black/45 rounded"
    >
      {{ readableTime }}
    </span>
  </div>

  <VideoBubble
    v-for="video in videos"
    :key="video.id || video.data_url"
    :url="video.data_url"
  />

  <audio
    v-for="audio in audios"
    :key="audio.id || audio.data_url"
    controls
    class="h-10 w-full dark:invert"
  >
    <source :src="audio.data_url" />
  </audio>

  <FileBubble
    v-for="file in files"
    :key="file.id || file.data_url"
    :url="file.data_url"
    :is-in-progress="isInProgress"
    :widget-color="widgetColor"
    :is-user-bubble="isUserBubble"
  />

  <Teleport to="body">
    <TakehkMediaViewer
      v-if="viewerIndex !== null"
      :items="images"
      :start-index="viewerIndex"
      @close="viewerIndex = null"
    />
  </Teleport>
</template>
