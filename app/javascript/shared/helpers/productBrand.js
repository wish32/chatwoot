export const PRODUCT_NAME = 'TakeHK';

const CHATWOOT_BRAND = /chatwoot(?!\.[a-z0-9])/gi;
const WOOT_BRAND = /\bwoot\b/gi;

export function replaceChatwootBrand(value) {
  if (typeof value !== 'string' || !value) return value;

  return value.replace(CHATWOOT_BRAND, PRODUCT_NAME).replace(WOOT_BRAND, PRODUCT_NAME);
}

export function replaceBrandInMessages(messages) {
  if (typeof messages === 'string') return replaceChatwootBrand(messages);
  if (Array.isArray(messages)) return messages.map(replaceBrandInMessages);
  if (messages && typeof messages === 'object') {
    return Object.fromEntries(
      Object.entries(messages).map(([key, nested]) => [
        key,
        replaceBrandInMessages(nested),
      ])
    );
  }
  return messages;
}
