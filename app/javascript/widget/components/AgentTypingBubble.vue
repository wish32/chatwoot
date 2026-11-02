<script>
import TypingDots from 'shared/components/TypingDots.vue';

export default {
  name: 'AgentTypingBubble',
  components: { TypingDots },
};
</script>

<template>
  <div class="agent-message-wrap sticky bottom-1">
    <div class="agent-message">
      <div class="avatar-wrap" />
      <div class="message-wrap mt-2">
        <div
          class="chat-bubble agent typing-bubble bg-n-background dark:bg-n-solid-3"
        >
          <TypingDots size="md" class="text-n-slate-11" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.typing-bubble {
  @apply inline-flex items-center max-w-[4.5rem] p-2 ltr:rounded-bl-[1.25rem] rtl:rounded-br-[1.25rem] ltr:rounded-tl-lg rtl:rounded-tr-lg;
}
</style>
