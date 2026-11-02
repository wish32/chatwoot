export function isDirectConversationEnabled() {
  return window.chatwootWebChannel?.directConversation !== false;
}

export function preChatFormRequired() {
  const channel = window.chatwootWebChannel || {};
  if (!channel.preChatFormEnabled) return false;

  const fields = channel.preChatFormOptions?.pre_chat_fields || [];
  return fields.some(field => field.enabled);
}

export function hasHelpCenter() {
  return !!window.chatwootWebChannel?.portal;
}

export function conversationEntryName(hasConversation, shouldShowPreChatForm) {
  if (shouldShowPreChatForm && !hasConversation) return 'prechat-form';
  return 'messages';
}
