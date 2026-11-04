// Yii2 sends zh-TW, zh-CN, and en-US. The widget catalog uses zh_TW, zh_CN, and en.
export function normalizeWidgetLocale(locale) {
  if (locale == null || locale === '') return '';
  const code = String(locale).trim().replace(/-/g, '_');
  const lower = code.toLowerCase();

  if (
    lower === 'zh_tw' ||
    lower === 'zh_hk' ||
    lower === 'zh_mo' ||
    lower.startsWith('zh_hant')
  ) {
    return 'zh_TW';
  }
  if (lower === 'zh_cn' || lower === 'zh_sg' || lower.startsWith('zh_hans')) {
    return 'zh_CN';
  }
  if (lower === 'zh') return 'zh_TW';
  return code;
}
