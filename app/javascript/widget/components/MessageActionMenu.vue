<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { emitter } from 'shared/helpers/mitt';
import { BUS_EVENTS } from 'shared/constants/busEvents';
import { copyTextToClipboard } from 'shared/helpers/clipboard';
import { MESSAGE_TYPE } from 'widget/helpers/constants';

const RECALL_WINDOW_MS = 10 * 60 * 1000;

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const store = useStore();
const { t } = useI18n();
const root = ref(null);
const open = ref(false);
const menuStyle = ref({});

const recalled = computed(() => !!props.message.content_attributes?.recalled);
const isOwn = computed(
  () => props.message.message_type === MESSAGE_TYPE.INCOMING
);
const ready = computed(() => {
  const { id, status } = props.message;
  return (
    Number.isInteger(Number(id)) &&
    status !== 'in_progress' &&
    status !== 'failed'
  );
});
const hasText = computed(() => !!props.message.content && !recalled.value);
const canReply = computed(
  () =>
    !recalled.value &&
    (props.message.content || props.message.attachments?.length)
);
const showRecall = computed(
  () => isOwn.value && !recalled.value && ready.value
);
const canRecall = computed(() => {
  const createdAt = Number(props.message.created_at || 0) * 1000;
  return showRecall.value && Date.now() - createdAt <= RECALL_WINDOW_MS;
});

const close = () => {
  open.value = false;
};

const toggle = event => {
  if (open.value) {
    close();
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const menuHeight = 168;
  const top =
    rect.bottom + menuHeight > window.innerHeight
      ? Math.max(8, rect.top - menuHeight)
      : rect.bottom + 6;
  menuStyle.value = {
    top: `${top}px`,
    left: `${Math.max(8, rect.right - 132)}px`,
  };
  open.value = true;
};

const onDocumentClick = event => {
  if (!root.value?.contains(event.target)) close();
};

const reply = () => {
  emitter.emit(BUS_EVENTS.TOGGLE_REPLY_TO_MESSAGE, props.message);
  close();
};

const copy = async () => {
  await copyTextToClipboard(props.message.content);
  emitter.emit(BUS_EVENTS.SHOW_ALERT, {
    message: t('MESSAGE_ACTIONS.COPIED'),
    type: 'success',
  });
  close();
};

const recall = async () => {
  try {
    await store.dispatch('conversation/recallMessage', props.message.id);
  } catch (error) {
    emitter.emit(BUS_EVENTS.SHOW_ALERT, {
      message: t('MESSAGE_ACTIONS.RECALL_FAILED'),
    });
  }
  close();
};

const remove = () => {
  store.dispatch('conversation/hideMessageLocally', props.message.id);
  close();
};

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>

<template>
  <div v-if="ready" ref="root" class="thd-msg-actions">
    <button
      type="button"
      class="thd-msg-actions__toggle"
      :aria-label="t('MESSAGE_ACTIONS.MENU')"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M6.5 9.5 12 15l5.5-5.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <div
      v-if="open"
      class="thd-msg-actions__menu"
      :style="menuStyle"
      @click.stop
    >
      <button v-if="canReply" type="button" @click="reply">
        {{ t('MESSAGE_ACTIONS.REPLY') }}
      </button>
      <button v-if="hasText" type="button" @click="copy">
        {{ t('MESSAGE_ACTIONS.COPY') }}
      </button>
      <button
        v-if="showRecall"
        type="button"
        :disabled="!canRecall"
        @click="recall"
      >
        {{ t('MESSAGE_ACTIONS.RECALL') }}
      </button>
      <button type="button" @click="remove">
        {{ t('MESSAGE_ACTIONS.DELETE') }}
      </button>
    </div>
  </div>
</template>
