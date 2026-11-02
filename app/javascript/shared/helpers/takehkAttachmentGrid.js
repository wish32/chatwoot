export const TAKEHK_MAX_ATTACHMENTS = 9;

export function attachmentGridColumns(count) {
  if (count <= 1) return 1;
  if (count === 2 || count === 4) return 2;
  return 3;
}
