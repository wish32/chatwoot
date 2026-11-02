<script>
import { mapGetters } from 'vuex';
import { IFrameHelper, RNHelper } from 'widget/helpers/utils';
import { popoutChatWindow } from '../helpers/popoutHelper';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';
import configMixin from 'widget/mixins/configMixin';
import { CONVERSATION_STATUS } from 'shared/constants/messages';
import { useDarkMode } from 'widget/composables/useDarkMode';
import { writeStoredTheme } from 'widget/helpers/threadTheme';
import EndConversationConfirm from 'widget/components/EndConversationConfirm.vue';

export default {
  name: 'HeaderActions',
  components: { FluentIcon, EndConversationConfirm },
  mixins: [configMixin],
  props: {
    showPopoutButton: {
      type: Boolean,
      default: false,
    },
    showEndConversationButton: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const { prefersDarkMode } = useDarkMode();
    return { prefersDarkMode };
  },
  data() {
    return {
      endConfirmOpen: false,
      endingConversation: false,
    };
  },
  computed: {
    ...mapGetters({
      conversationAttributes: 'conversationAttributes/getConversationParams',
      canUserEndConversation: 'appConfig/getCanUserEndConversation',
    }),
    canLeaveConversation() {
      return [
        CONVERSATION_STATUS.OPEN,
        CONVERSATION_STATUS.SNOOZED,
        CONVERSATION_STATUS.PENDING,
        CONVERSATION_STATUS.RESOLVED,
      ].includes(this.conversationStatus);
    },
    isIframe() {
      return IFrameHelper.isIFrame();
    },
    isRNWebView() {
      return RNHelper.isRNWebView();
    },
    showHeaderActions() {
      return this.isIframe || this.isRNWebView || this.hasWidgetOptions;
    },
    conversationStatus() {
      return this.conversationAttributes.status;
    },
    hasWidgetOptions() {
      return this.showPopoutButton || this.conversationStatus === 'open';
    },
  },
  methods: {
    popoutWindow() {
      this.closeWindow();
      const {
        location: { origin },
        chatwootWebChannel: { websiteToken },
        authToken,
      } = window;
      popoutChatWindow(
        origin,
        websiteToken,
        this.$root.$i18n.locale,
        authToken
      );
    },
    closeWindow() {
      if (IFrameHelper.isIFrame()) {
        IFrameHelper.sendMessage({ event: 'closeWindow' });
      } else if (RNHelper.isRNWebView) {
        RNHelper.sendMessage({ type: 'close-widget' });
      }
    },
    toggleThreadTheme() {
      const next = this.prefersDarkMode ? 'light' : 'dark';
      writeStoredTheme(next);
      this.$store.dispatch('appConfig/setColorScheme', next);
    },
    askToEndConversation() {
      this.endConfirmOpen = true;
    },
    cancelEndConversation() {
      this.endConfirmOpen = false;
    },
    async confirmEndConversation() {
      if (this.endingConversation) return;
      this.endingConversation = true;
      this.endConfirmOpen = false;
      try {
        await this.$store.dispatch('conversation/resolveConversation');
        this.closeWindow();
      } finally {
        this.endingConversation = false;
      }
    },
  },
};
</script>

<!-- eslint-disable-next-line vue/no-root-v-if -->
<template>
  <div v-if="showHeaderActions" class="actions flex items-center gap-3">
    <button
      type="button"
      class="button transparent compact takehk-theme-toggle"
      :aria-label="prefersDarkMode ? 'Light' : 'Dark'"
      @click="toggleThreadTheme"
    >
      <svg
        v-if="prefersDarkMode"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2.5v2.2M12 19.3v2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.8 19.2l1.6-1.6M17.6 6.4l1.6-1.6"
        />
      </svg>
      <svg
        v-else
        class="is-moon"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
      >
        <path d="M16.5 13.2A6.2 6.2 0 1 1 10.8 5 5 5 0 0 0 16.5 13.2z" />
      </svg>
    </button>
    <button
      v-if="
        canLeaveConversation &&
        canUserEndConversation &&
        hasEndConversationEnabled &&
        showEndConversationButton
      "
      class="button transparent compact"
      :title="$t('END_CONVERSATION')"
      @click="askToEndConversation"
    >
      <FluentIcon icon="sign-out" size="22" class="text-n-slate-12" />
    </button>
    <button
      v-if="showPopoutButton"
      class="button transparent compact new-window--button"
      @click="popoutWindow"
    >
      <FluentIcon icon="open" size="22" class="text-n-slate-12" />
    </button>
    <button
      class="button transparent compact close-button"
      :class="{
        'rn-close-button': isRNWebView,
      }"
      @click="closeWindow"
    >
      <FluentIcon icon="dismiss" size="24" class="text-n-slate-12" />
    </button>
    <EndConversationConfirm
      v-if="endConfirmOpen"
      @confirm="confirmEndConversation"
      @cancel="cancelEndConversation"
    />
  </div>
</template>

<style scoped lang="scss">
.actions {
  .takehk-theme-toggle svg {
    display: block;
    fill: none;
    stroke: rgb(var(--slate-12));
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .takehk-theme-toggle svg.is-moon {
    fill: rgb(var(--slate-12));
    stroke: none;
  }

  .close-button {
    display: none;
  }

  .rn-close-button {
    display: block !important;
  }
}
</style>
