<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import Draggable from 'vuedraggable';
import { useAlert } from 'dashboard/composables';
import SettingsToggleSection from 'dashboard/components-next/Settings/SettingsToggleSection.vue';
import NextButton from 'dashboard/components-next/button/Button.vue';
import Input from 'dashboard/components-next/input/Input.vue';
import Icon from 'dashboard/components-next/icon/Icon.vue';

const MAX_ACTIONS = 8;
const MAX_ID_LENGTH = 64;
const MAX_LABEL_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 1000;
const SLUG = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/i;

const props = defineProps({
  inbox: {
    type: Object,
    default: () => ({}),
  },
});

const { t } = useI18n();
const store = useStore();

const actions = ref([]);
const fieldErrors = ref({});
const formError = ref('');
const isSaving = ref(false);
const hydrated = ref(false);
const lastApplied = ref('');
let keySeq = 0;

function nextKey() {
  keySeq += 1;
  return `qa-${keySeq}`;
}

function text(value) {
  return String(value || '').trim();
}

function toEditorItems(source) {
  const list = Array.isArray(source) ? source : [];
  return list.map(item => ({
    clientKey: nextKey(),
    id: text(item.id),
    label_zh: text(item.label_zh || item.labelZh),
    label_en: text(item.label_en || item.labelEn),
    message_zh: text(item.message_zh || item.messageZh),
    message_en: text(item.message_en || item.messageEn),
  }));
}

function payloadOf(list) {
  return list.map(item => ({
    id: text(item.id),
    label_zh: text(item.label_zh),
    label_en: text(item.label_en),
    message_zh: text(item.message_zh),
    message_en: text(item.message_en),
  }));
}

function applyFromInbox(source) {
  const next = toEditorItems(source);
  actions.value = next;
  lastApplied.value = JSON.stringify(payloadOf(next));
  fieldErrors.value = {};
  formError.value = '';
  hydrated.value = true;
}

watch(
  () => [props.inbox?.id, props.inbox?.takehk_quick_actions],
  (current, previous) => {
    const [id, value] = current || [];
    const inboxChanged = !previous || previous[0] !== id;
    const incoming = JSON.stringify(payloadOf(toEditorItems(value)));
    const local = JSON.stringify(payloadOf(actions.value));
    const dirty = hydrated.value && local !== lastApplied.value;
    if (!inboxChanged && dirty && local !== incoming) return;
    applyFromInbox(value);
  },
  { immediate: true, deep: true }
);

function errorFor(item, field) {
  return fieldErrors.value[item.clientKey]?.[field] || '';
}

function validate() {
  const nextErrors = {};
  const seen = new Set();
  if (actions.value.length > MAX_ACTIONS) {
    formError.value = t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ERRORS.LIMIT');
  }

  actions.value.forEach(item => {
    const itemErrors = {};
    const id = text(item.id);
    if (!id) {
      itemErrors.id = t(
        'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ERRORS.ID_REQUIRED'
      );
    } else if (id.length > MAX_ID_LENGTH || !SLUG.test(id)) {
      itemErrors.id = t(
        'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ERRORS.ID_FORMAT'
      );
    } else if (seen.has(id.toLowerCase())) {
      itemErrors.id = t(
        'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ERRORS.ID_DUPLICATE'
      );
    } else {
      seen.add(id.toLowerCase());
    }

    const labelZh = text(item.label_zh);
    const labelEn = text(item.label_en);
    if (!labelZh && !labelEn) {
      itemErrors.label = t(
        'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ERRORS.LABEL_REQUIRED'
      );
    }
    if (
      labelZh.length > MAX_LABEL_LENGTH ||
      labelEn.length > MAX_LABEL_LENGTH
    ) {
      itemErrors.label = t(
        'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ERRORS.LABEL_TOO_LONG'
      );
    }
    if (
      text(item.message_zh).length > MAX_MESSAGE_LENGTH ||
      text(item.message_en).length > MAX_MESSAGE_LENGTH
    ) {
      itemErrors.message = t(
        'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ERRORS.MESSAGE_TOO_LONG'
      );
    }
    if (Object.keys(itemErrors).length) nextErrors[item.clientKey] = itemErrors;
  });

  fieldErrors.value = nextErrors;
  return !formError.value && Object.keys(nextErrors).length === 0;
}

function addAction() {
  if (actions.value.length >= MAX_ACTIONS) {
    formError.value = t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ERRORS.LIMIT');
    return;
  }
  formError.value = '';
  actions.value.push({
    clientKey: nextKey(),
    id: '',
    label_zh: '',
    label_en: '',
    message_zh: '',
    message_en: '',
  });
}

function removeAction(index) {
  actions.value.splice(index, 1);
  formError.value = '';
}

async function save() {
  formError.value = '';
  if (!validate()) return;

  isSaving.value = true;
  try {
    await store.dispatch('inboxes/updateInbox', {
      id: props.inbox.id,
      formData: false,
      channel: {
        takehk_quick_actions: payloadOf(actions.value),
      },
    });
    lastApplied.value = JSON.stringify(payloadOf(actions.value));
    useAlert(t('INBOX_MGMT.EDIT.API.SUCCESS_MESSAGE'));
  } catch (error) {
    useAlert(t('INBOX_MGMT.EDIT.API.ERROR_MESSAGE'));
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <SettingsToggleSection
    :header="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.TITLE')"
    :description="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.DESCRIPTION')"
    hide-toggle
  >
    <template #editor>
      <p
        v-if="formError"
        class="mb-3 text-sm text-n-ruby-11"
        role="alert"
      >
        {{ formError }}
      </p>
      <p
        v-if="!actions.length"
        class="mb-3 text-sm text-n-slate-11"
      >
        {{ $t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.EMPTY') }}
      </p>
      <Draggable
        v-model="actions"
        item-key="clientKey"
        handle=".quick-action-drag"
        class="flex flex-col gap-3"
      >
        <template #item="{ element, index }">
          <div
            class="rounded-lg outline outline-1 outline-n-weak bg-n-alpha-black2 p-3"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                class="quick-action-drag inline-flex cursor-grab items-center text-n-slate-11"
                :aria-label="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.TITLE')"
              >
                <Icon icon="i-woot-drag-indicator" class="size-4" />
              </button>
              <NextButton
                type="button"
                variant="ghost"
                color="ruby"
                size="sm"
                icon="i-lucide-trash-2"
                :label="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.REMOVE')"
                @click="removeAction(index)"
              />
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                v-model="element.id"
                :label="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ID')"
                :placeholder="
                  $t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ID_PLACEHOLDER')
                "
                :message="errorFor(element, 'id')"
                :message-type="errorFor(element, 'id') ? 'error' : 'info'"
              />
              <div class="hidden md:block" />
              <Input
                v-model="element.label_zh"
                :label="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.LABEL_ZH')"
                :placeholder="
                  $t(
                    'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.LABEL_ZH_PLACEHOLDER'
                  )
                "
                :message="errorFor(element, 'label')"
                :message-type="errorFor(element, 'label') ? 'error' : 'info'"
              />
              <Input
                v-model="element.label_en"
                :label="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.LABEL_EN')"
                :placeholder="
                  $t(
                    'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.LABEL_EN_PLACEHOLDER'
                  )
                "
              />
              <Input
                v-model="element.message_zh"
                :label="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.MESSAGE_ZH')"
                :placeholder="
                  $t(
                    'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.MESSAGE_ZH_PLACEHOLDER'
                  )
                "
                :message="errorFor(element, 'message')"
                :message-type="errorFor(element, 'message') ? 'error' : 'info'"
              />
              <Input
                v-model="element.message_en"
                :label="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.MESSAGE_EN')"
                :placeholder="
                  $t(
                    'INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.MESSAGE_EN_PLACEHOLDER'
                  )
                "
              />
            </div>
            <p class="mt-2 mb-0 text-label-small text-n-slate-11">
              {{ $t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.MESSAGE_HINT') }}
            </p>
          </div>
        </template>
      </Draggable>
      <p class="mt-3 mb-0 text-label-small text-n-slate-11">
        {{ $t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.LIMIT') }}
      </p>
      <div class="mt-3 flex items-center justify-between gap-3">
        <NextButton
          type="button"
          variant="faded"
          color="slate"
          icon="i-lucide-plus"
          :label="$t('INBOX_MGMT.SETTINGS_POPUP.QUICK_ACTIONS.ADD')"
          :disabled="actions.length >= MAX_ACTIONS"
          @click="addAction"
        />
        <NextButton
          type="button"
          :label="$t('INBOX_MGMT.SETTINGS_POPUP.UPDATE')"
          :is-loading="isSaving"
          @click="save"
        />
      </div>
    </template>
  </SettingsToggleSection>
</template>
