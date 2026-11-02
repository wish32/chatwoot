<script setup>
import { computed, ref, useAttrs } from 'vue';

import ImageChip from 'next/message/chips/Image.vue';
import VideoChip from 'next/message/chips/Video.vue';
import AudioChip from 'next/message/chips/Audio.vue';
import FileChip from 'next/message/chips/File.vue';
import GalleryView from 'dashboard/components/widgets/conversation/components/GalleryView.vue';
import { useSnakeCase } from 'dashboard/composables/useTransformKeys';
import { attachmentGridColumns } from 'shared/helpers/takehkAttachmentGrid';
import { useMessageContext } from '../provider.js';

import { ATTACHMENT_TYPES } from '../constants';

/**
 * @typedef {Object} Attachment
 * @property {number} id - Unique identifier for the attachment
 * @property {number} messageId - ID of the associated message
 * @property {'image'|'audio'|'video'|'file'|'location'|'fallback'|'share'|'story_mention'|'contact'|'ig_reel'} fileType - Type of the attachment (file or image)
 * @property {number} accountId - ID of the associated account
 * @property {string|null} extension - File extension
 * @property {string} dataUrl - URL to access the full attachment data
 * @property {string} thumbUrl - URL to access the thumbnail version
 * @property {number} fileSize - Size of the file in bytes
 * @property {number|null} width - Width of the image if applicable
 * @property {number|null} height - Height of the image if applicable
 */
const props = defineProps({
  attachments: {
    type: Array,
    default: () => [],
  },
});

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();
const { orientation } = useMessageContext();
const showGallery = ref(false);
const activeImage = ref(null);

const classToApply = computed(() => {
  const baseClasses = [attrs.class, 'flex', 'flex-wrap'];

  if (orientation.value === 'right') {
    baseClasses.push('justify-end');
  }

  return baseClasses;
});

const allAttachments = computed(() => {
  return Array.isArray(props.attachments) ? props.attachments : [];
});

const images = computed(() =>
  allAttachments.value.filter(
    attachment => attachment.fileType === ATTACHMENT_TYPES.IMAGE
  )
);

const videos = computed(() =>
  allAttachments.value.filter(
    attachment => attachment.fileType === ATTACHMENT_TYPES.VIDEO
  )
);

const imageGridClass = computed(() =>
  attachmentGridColumns(images.value.length) === 2
    ? 'grid-cols-2'
    : 'grid-cols-3'
);

const openImage = image => {
  activeImage.value = image;
  showGallery.value = true;
};

const recordings = computed(() => {
  return allAttachments.value.filter(
    attachment => attachment.fileType === ATTACHMENT_TYPES.AUDIO
  );
});

const files = computed(() => {
  return allAttachments.value.filter(
    attachment => attachment.fileType === ATTACHMENT_TYPES.FILE
  );
});
</script>

<template>
  <div
    v-if="images.length > 1"
    class="grid gap-0.5 w-64 max-w-full overflow-hidden rounded-lg"
    :class="imageGridClass"
  >
    <button
      v-for="image in images"
      :key="image.id"
      type="button"
      class="aspect-square p-0 border-0 overflow-hidden cursor-pointer"
      @click="openImage(image)"
    >
      <img :src="image.dataUrl" alt="" class="size-full object-cover" />
    </button>
  </div>
  <GalleryView
    v-if="showGallery && activeImage"
    v-model:show="showGallery"
    :attachment="useSnakeCase(activeImage)"
    :all-attachments="images.map(image => useSnakeCase(image))"
    @close="showGallery = false"
  />
  <div v-if="images.length === 1" :class="classToApply">
    <ImageChip :attachment="images[0]" />
  </div>
  <div v-if="videos.length" :class="classToApply">
    <VideoChip
      v-for="attachment in videos"
      :key="attachment.id"
      :attachment="attachment"
    />
  </div>
  <div v-if="recordings.length" :class="classToApply">
    <div v-for="attachment in recordings" :key="attachment.id">
      <AudioChip
        class="bg-n-alpha-3 dark:bg-n-alpha-2 text-n-slate-12"
        :attachment="attachment"
      />
    </div>
  </div>
  <div v-if="files.length" :class="classToApply">
    <FileChip
      v-for="attachment in files"
      :key="attachment.id"
      :attachment="attachment"
    />
  </div>
</template>
