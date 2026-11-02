const storageKey = () => {
  const token = window.chatwootWebChannel?.websiteToken || 'widget';
  return `takehk-hidden-message-ids:${token}`;
};

const readIds = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey()) || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (error) {
    return [];
  }
};

const ids = new Set(readIds());

export const isHiddenMessage = id => ids.has(String(id));

export const rememberHiddenMessage = id => {
  ids.add(String(id));
  window.localStorage.setItem(storageKey(), JSON.stringify([...ids]));
};

export const withoutHiddenMessages = messages =>
  (messages || []).filter(message => message && !isHiddenMessage(message.id));
