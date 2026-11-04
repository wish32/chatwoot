import { MESSAGE_TYPE } from 'widget/helpers/constants';

export function visitorHasOpenedTopic(messages) {
  return (messages || []).some(message => {
    if (!message || message.message_type !== MESSAGE_TYPE.INCOMING) return false;
    return String(message.content || '').trim().length > 0;
  });
}

export function preferChineseLocale(locale) {
  const value = String(locale || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  return value === 'zh' || value.startsWith('zh_');
}

export function resolveQuickActions(source) {
  const list = Array.isArray(source) ? source : [];
  return list
    .map(item => {
      const id = String(item.id || item.value || '').trim();
      const labelZh = String(item.label_zh || item.labelZh || '').trim();
      const labelEn = String(item.label_en || item.labelEn || '').trim();
      const messageZh = String(item.message_zh || item.messageZh || labelZh).trim();
      const messageEn = String(item.message_en || item.messageEn || labelEn).trim();
      if (!id || (!labelZh && !labelEn)) return null;
      return { id, labelZh, labelEn, messageZh, messageEn };
    })
    .filter(Boolean);
}

export function quickActionLabel(action, useChinese) {
  if (!action) return '';
  if (useChinese) return action.labelZh || action.labelEn;
  return action.labelEn || action.labelZh;
}

export function quickActionMessage(action, useChinese) {
  if (!action) return '';
  if (useChinese) return action.messageZh || action.messageEn;
  return action.messageEn || action.messageZh;
}
