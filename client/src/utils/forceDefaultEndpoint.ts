import { LocalStorageKeys } from 'librechat-data-provider';

export function forceChatGPTBrowserEndpoint() {
  // Clear all endpoint-related localStorage
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (
      key.startsWith(LocalStorageKeys.LAST_CONVO_SETUP) ||
      key === LocalStorageKeys.LAST_MODEL ||
      key === LocalStorageKeys.LAST_SPEC
    ) {
      localStorage.removeItem(key);
    }
  });

  // Set chatGPTBrowser as the default endpoint
  const defaultSetup = {
    endpoint: 'chatGPTBrowser',
    conversationId: 'new',
    title: 'New Chat',
    createdAt: '',
    updatedAt: '',
  };

  localStorage.setItem(
    `${LocalStorageKeys.LAST_CONVO_SETUP}_0`,
    JSON.stringify(defaultSetup)
  );

  // Force page reload to apply changes
  window.location.reload();
}

// Auto-execute when imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  forceChatGPTBrowserEndpoint();
} 