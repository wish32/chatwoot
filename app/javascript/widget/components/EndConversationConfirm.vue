<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['confirm', 'cancel']);
const { t } = useI18n();
const continueButton = ref(null);

const onKeydown = event => {
  if (event.key !== 'Enter' && event.key !== 'Escape') return;
  event.preventDefault();
  event.stopPropagation();
  if (event.key === 'Enter') emit('confirm');
  else emit('cancel');
};

const onKeypress = event => {
  if (event.key === 'Enter' || event.keyCode === 13) {
    event.preventDefault();
    event.stopPropagation();
  }
};

onMounted(() => {
  document.addEventListener('keydown', onKeydown, true);
  document.addEventListener('keypress', onKeypress, true);
  continueButton.value?.focus();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown, true);
  document.removeEventListener('keypress', onKeypress, true);
});
</script>

<template>
  <div class="thd-end-confirm" @click.self="emit('cancel')">
    <div
      class="thd-end-confirm__card"
      role="dialog"
      aria-modal="true"
      :aria-label="t('END_CONVERSATION_CONFIRM.MESSAGE')"
    >
      <p class="thd-end-confirm__text">
        {{ t('END_CONVERSATION_CONFIRM.MESSAGE') }}
      </p>
      <div class="thd-end-confirm__actions">
        <button type="button" class="thd-end-confirm__cancel" @click="emit('cancel')">
          {{ t('END_CONVERSATION_CONFIRM.CANCEL') }}
        </button>
        <button
          ref="continueButton"
          type="button"
          class="thd-end-confirm__continue"
          @click="emit('confirm')"
        >
          {{ t('END_CONVERSATION_CONFIRM.CONTINUE') }}
        </button>
      </div>
    </div>
  </div>
</template>
