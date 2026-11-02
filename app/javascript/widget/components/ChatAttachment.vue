<script>
import FileUpload from 'vue-upload-component';
import Spinner from 'shared/components/Spinner.vue';
import {
  checkFileSizeLimit,
  resolveMaximumFileUploadSize,
} from 'shared/helpers/FileHelper';
import { ALLOWED_FILE_TYPES } from 'shared/constants/messages';
import { BUS_EVENTS } from 'shared/constants/busEvents';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';
import { DirectUpload } from 'activestorage';
import { mapGetters } from 'vuex';
import { emitter } from 'shared/helpers/mitt';
import { useAttachments } from '../composables/useAttachments';
import { TAKEHK_MAX_ATTACHMENTS } from 'shared/helpers/takehkAttachmentGrid';

export default {
  components: { FluentIcon, FileUpload, Spinner },
  props: {
    onAttach: {
      type: Function,
      default: () => {},
    },
  },
  setup() {
    const { canHandleAttachments } = useAttachments();
    return { canHandleAttachments };
  },
  data() {
    return { isUploading: false, pendingFiles: [], flushTimer: null };
  },
  computed: {
    ...mapGetters({
      globalConfig: 'globalConfig/get',
    }),
    fileUploadSizeLimit() {
      return resolveMaximumFileUploadSize(
        this.globalConfig.maximumFileUploadSize
      );
    },
    allowedFileTypes() {
      return ALLOWED_FILE_TYPES;
    },
  },
  mounted() {
    document.addEventListener('paste', this.handleClipboardPaste);
  },
  unmounted() {
    document.removeEventListener('paste', this.handleClipboardPaste);
    clearTimeout(this.flushTimer);
  },
  methods: {
    handleClipboardPaste(e) {
      // If file picker is not enabled, do not allow paste
      if (!this.canHandleAttachments) return;

      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      // items is a DataTransferItemList object which does not have forEach method
      const itemsArray = Array.from(items);
      itemsArray.forEach(item => {
        if (item.kind === 'file') {
          e.preventDefault();
          const file = item.getAsFile();
          this.$refs.upload.add(file);
        }
      });
    },
    getFileType(fileType = '') {
      if (fileType.includes('image')) return 'image';
      if (fileType.includes('video')) return 'video';
      if (fileType.includes('audio')) return 'audio';
      return 'file';
    },
    onFileUpload(newFile, oldFile) {
      if (!newFile || oldFile) return;

      this.pendingFiles.push(newFile);
      clearTimeout(this.flushTimer);
      this.flushTimer = setTimeout(() => {
        this.flushPendingFiles();
      }, 40);
    },
    async flushPendingFiles() {
      const queued = this.pendingFiles.splice(0, this.pendingFiles.length);
      if (!queued.length) return;

      const accepted = [];
      let oversized = false;
      queued.forEach(file => {
        if (accepted.length >= TAKEHK_MAX_ATTACHMENTS) return;
        if (checkFileSizeLimit(file, this.fileUploadSizeLimit)) {
          accepted.push(file);
        } else {
          oversized = true;
        }
      });

      if (queued.length > TAKEHK_MAX_ATTACHMENTS) {
        emitter.emit(BUS_EVENTS.SHOW_ALERT, {
          message: this.$t('FILE_COUNT_LIMIT', {
            count: TAKEHK_MAX_ATTACHMENTS,
          }),
        });
      }
      if (oversized) {
        emitter.emit(BUS_EVENTS.SHOW_ALERT, {
          message: this.$t('FILE_SIZE_LIMIT', {
            MAXIMUM_FILE_UPLOAD_SIZE: this.fileUploadSizeLimit,
          }),
        });
      }
      if (!accepted.length) return;

      this.isUploading = true;
      try {
        const prepared = await accepted.reduce(async (collected, file) => {
          const items = await collected;
          const item = await this.prepareUpload(file);
          if (item) items.push(item);
          return items;
        }, Promise.resolve([]));
        if (prepared.length) await this.onAttach({ files: prepared });
      } catch (error) {
        // Error
      }
      this.isUploading = false;
    },
    prepareUpload(file) {
      if (this.globalConfig.directUploadsEnabled) {
        return this.directUpload(file);
      }
      return Promise.resolve({
        file: file.file,
        ...this.getLocalFileAttributes(file),
      });
    },
    directUpload(file) {
      const { websiteToken } = window.chatwootWebChannel;
      const upload = new DirectUpload(
        file.file,
        `/api/v1/widget/direct_uploads?website_token=${websiteToken}`,
        {
          directUploadWillCreateBlobWithXHR: xhr => {
            xhr.setRequestHeader('X-Auth-Token', window.authToken);
          },
        }
      );

      return new Promise(resolve => {
        upload.create((error, blob) => {
          if (error) {
            emitter.emit(BUS_EVENTS.SHOW_ALERT, { message: error });
            resolve(null);
            return;
          }
          resolve({
            file: blob.signed_id,
            ...this.getLocalFileAttributes(file),
          });
        });
      });
    },
    getLocalFileAttributes(file) {
      return {
        thumbUrl: window.URL.createObjectURL(file.file),
        fileType: this.getFileType(file.type),
      };
    },
  },
};
</script>

<template>
  <FileUpload
    ref="upload"
    :size="4096 * 2048"
    :accept="allowedFileTypes"
    :multiple="true"
    :data="{
      direct_upload_url: '/api/v1/widget/direct_uploads',
      direct_upload: true,
    }"
    @input-file="onFileUpload"
  >
    <button class="min-h-8 min-w-8 flex items-center justify-center">
      <FluentIcon v-if="!isUploading.image" icon="attach" />
      <Spinner v-if="isUploading" size="small" />
    </button>
  </FileUpload>
</template>
