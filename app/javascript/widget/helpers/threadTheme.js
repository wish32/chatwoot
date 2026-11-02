const STORAGE_KEY = 'takehk-widget-theme';

export function readStoredTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : '';
  } catch (error) {
    return '';
  }
}

export function writeStoredTheme(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    // Storage can be blocked. The choice still applies for this visit.
  }
}
