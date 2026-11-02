<script>
import UserMessageBubble from 'widget/components/UserMessageBubble.vue';
import MessageActionMenu from 'widget/components/MessageActionMenu.vue';
import TakehkAttachmentGroup from 'widget/components/TakehkAttachmentGroup.vue';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';
import { messageStamp } from 'shared/helpers/timeHelper';
import messageMixin from '../mixins/messageMixin';
import ReplyToChip from 'widget/components/ReplyToChip.vue';
import DragWrapper from 'widget/components/DragWrapper.vue';
import { BUS_EVENTS } from 'shared/constants/busEvents';
import { emitter } from 'shared/helpers/mitt';
import { mapGetters } from 'vuex';

export default {
  name: 'UserMessage',
  components: {
    UserMessageBubble,
    MessageActionMenu,
    TakehkAttachmentGroup,
    FluentIcon,
    ReplyToChip,
    DragWrapper,
  },
  mixins: [messageMixin],
  props: {
    message: {
      type: Object,
      default: () => {},
    },
    replyTo: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapGetters({
      widgetColor: 'appConfig/getWidgetColor',
    }),

    isInProgress() {
      const { status = '' } = this.message;
      return status === 'in_progress';
    },
    isRecalled() {
      return !!this.message.content_attributes?.recalled;
    },
    showTextBubble() {
      const { message } = this;
      return !!message.content || this.isRecalled;
    },
    displayContent() {
      if (this.isRecalled) return this.$t('MESSAGE_ACTIONS.RECALLED');
      return this.message.content;
    },
    readableTime() {
      const { created_at: createdAt = '' } = this.message;
      return messageStamp(createdAt, 'HH:mm');
    },
    isFailed() {
      const { status = '' } = this.message;
      return status === 'failed';
    },
    errorMessage() {
      const { meta } = this.message;
      return meta
        ? meta.error
        : this.$t('COMPONENTS.MESSAGE_BUBBLE.ERROR_MESSAGE');
    },
    hasReplyTo() {
      return this.replyTo && (this.replyTo.content || this.replyTo.attachments);
    },
  },
  methods: {
    async retrySendMessage() {
      await this.$store.dispatch('conversation/sendMessageWithData', {
        message: this.message,
      });
    },
    toggleReply() {
      emitter.emit(BUS_EVENTS.TOGGLE_REPLY_TO_MESSAGE, this.message);
    },
  },
};
</script>

<template>
  <div class="user-message-wrap group">
    <div class="flex gap-1 user-message">
      <div
        class="message-wrap"
        :class="{ 'in-progress': isInProgress, 'is-failed': isFailed }"
      >
        <div v-if="hasReplyTo" class="flex justify-end mt-2 mb-1 text-xs">
          <ReplyToChip :reply-to="replyTo" />
        </div>
        <div
          class="flex justify-end gap-1"
          :class="{ 'is-recalled': isRecalled }"
        >
          <DragWrapper direction="left" @dragged="toggleReply">
            <UserMessageBubble
              v-if="showTextBubble"
              :message="displayContent"
              :status="message.status"
              :widget-color="widgetColor"
              :readable-time="readableTime"
            />
            <div v-if="hasAttachments" class="chat-bubble has-attachment user">
              <TakehkAttachmentGroup
                :attachments="message.attachments"
                :widget-color="widgetColor"
                :is-in-progress="isInProgress"
                :readable-time="readableTime"
                is-user-bubble
              />
            </div>
          </DragWrapper>
          <MessageActionMenu :message="message" />
        </div>
        <div
          v-if="isFailed"
          class="flex justify-end px-4 py-2 text-n-ruby-9 align-middle"
        >
          <button
            v-if="!hasAttachments"
            :title="$t('COMPONENTS.MESSAGE_BUBBLE.RETRY')"
            class="inline-flex items-center justify-center ltr:ml-2 rtl:mr-2"
            @click="retrySendMessage"
          >
            <FluentIcon icon="arrow-clockwise" size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
