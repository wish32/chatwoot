<script>
import UserMessage from 'widget/components/UserMessage.vue';
import AgentMessageBubble from 'widget/components/AgentMessageBubble.vue';
import MessageActionMenu from 'widget/components/MessageActionMenu.vue';
import { messageStamp } from 'shared/helpers/timeHelper';
import TakehkAttachmentGroup from 'widget/components/TakehkAttachmentGroup.vue';
import Avatar from 'dashboard/components-next/avatar/Avatar.vue';
import { MESSAGE_TYPE } from 'widget/helpers/constants';
import configMixin from '../mixins/configMixin';
import messageMixin from '../mixins/messageMixin';
import { isASubmittedFormMessage } from 'shared/helpers/MessageTypeHelper';
import ReplyToChip from 'widget/components/ReplyToChip.vue';

export default {
  name: 'AgentMessage',
  components: {
    AgentMessageBubble,
    TakehkAttachmentGroup,
    Avatar,
    UserMessage,
    MessageActionMenu,
    ReplyToChip,
  },
  mixins: [configMixin, messageMixin],
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
    isRecalled() {
      return !!this.message.content_attributes?.recalled;
    },
    shouldDisplayAgentMessage() {
      if (this.isRecalled) return true;
      if (
        this.contentType === 'input_select' &&
        this.messageContentAttributes.submitted_values &&
        !this.message.content
      ) {
        return false;
      }
      return this.message.content;
    },
    displayContent() {
      if (this.isRecalled) return this.$t('MESSAGE_ACTIONS.RECALLED');
      return this.message.content;
    },
    readableTime() {
      const { created_at: createdAt = '' } = this.message;
      return messageStamp(createdAt, 'HH:mm');
    },
    messageType() {
      const { message_type: type = 1 } = this.message;
      return type;
    },
    contentType() {
      const { content_type: type = '' } = this.message;
      return type;
    },
    agentName() {
      if (this.message.sender) {
        return this.message.sender.available_name || this.message.sender.name;
      }

      if (this.message.additional_attributes?.sender_name) {
        return this.message.additional_attributes.sender_name;
      }

      if (this.useInboxAvatarForBot) {
        return this.channelConfig.websiteName;
      }

      return this.$t('UNREAD_VIEW.BOT');
    },
    avatarUrl() {
      const displayImage = this.useInboxAvatarForBot
        ? this.inboxAvatarUrl
        : '/assets/images/chatwoot_bot.png';

      if (this.message.message_type === MESSAGE_TYPE.TEMPLATE) {
        return displayImage;
      }

      if (this.message.sender) {
        return this.message.sender.avatar_url;
      }

      return (
        this.message.additional_attributes?.sender_avatar_url || displayImage
      );
    },
    hasRecordedResponse() {
      return (
        this.messageContentAttributes.submitted_email ||
        (this.messageContentAttributes.submitted_values &&
          !['form', 'input_csat'].includes(this.contentType))
      );
    },
    responseMessage() {
      if (this.messageContentAttributes.submitted_email) {
        return { content: this.messageContentAttributes.submitted_email };
      }

      if (this.messageContentAttributes.submitted_values) {
        if (this.contentType === 'input_select') {
          const [selectionOption = {}] =
            this.messageContentAttributes.submitted_values;
          return { content: selectionOption.title || selectionOption.value };
        }
      }
      return '';
    },
    isASubmittedForm() {
      return isASubmittedFormMessage(this.message);
    },
    submittedFormValues() {
      return this.messageContentAttributes.submitted_values.map(
        submittedValue => ({
          id: submittedValue.name,
          content: submittedValue.value,
        })
      );
    },
    wrapClass() {
      return {
        'has-text': this.shouldDisplayAgentMessage,
      };
    },
    hasReplyTo() {
      return this.replyTo && (this.replyTo.content || this.replyTo.attachments);
    },
  },
};
</script>

<template>
  <div
    class="agent-message-wrap group"
    :class="{
      'has-response': hasRecordedResponse || isASubmittedForm,
    }"
  >
    <div v-if="!isASubmittedForm" class="agent-message">
      <div class="avatar-wrap">
        <div class="user-thumbnail-box">
          <Avatar
            v-if="message.showAvatar || hasRecordedResponse"
            :src="avatarUrl"
            :size="24"
            :name="agentName"
            rounded-full
          />
        </div>
      </div>
      <div class="message-wrap">
        <div v-if="hasReplyTo" class="flex mt-2 mb-1 text-xs">
          <ReplyToChip :reply-to="replyTo" />
        </div>
        <div
          class="flex w-full gap-1"
          :class="{ 'is-recalled': isRecalled }"
        >
          <div
            class="space-y-2"
            :class="{
              'w-full':
                contentType === 'form' &&
                !messageContentAttributes?.submitted_values,
            }"
          >
            <AgentMessageBubble
              v-if="shouldDisplayAgentMessage"
              :content-type="contentType"
              :message-content-attributes="messageContentAttributes"
              :message-id="message.id"
              :message-type="messageType"
              :message="displayContent"
              :readable-time="readableTime"
            />
            <div
              v-if="hasAttachments"
              class="space-y-2 chat-bubble has-attachment agent"
              :class="wrapClass"
            >
              <TakehkAttachmentGroup
                :attachments="message.attachments"
                :readable-time="readableTime"
              />
            </div>
          </div>
          <MessageActionMenu :message="message" />
        </div>
        <p
          v-if="message.showAvatar || hasRecordedResponse"
          class="agent-name text-n-slate-11"
        >
          {{ agentName }}
        </p>
      </div>
    </div>

    <UserMessage v-if="hasRecordedResponse" :message="responseMessage" />
    <div v-if="isASubmittedForm">
      <UserMessage
        v-for="submittedValue in submittedFormValues"
        :key="submittedValue.id"
        :message="submittedValue"
      />
    </div>
  </div>
</template>
