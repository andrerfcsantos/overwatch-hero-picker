export function sendEvent(category, action, value) {
  if (!Array.isArray(window._paq) && window._paq.push) {
    window._paq.push(["trackEvent", category, action, value]);
  }
}
