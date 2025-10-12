/**
 * Token usage tracking store
 */
import { writable } from 'svelte/store';

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

function createTokenStore() {
  // Load from sessionStorage if available
  const stored = typeof sessionStorage !== 'undefined' 
    ? sessionStorage.getItem('tinyverse_token_usage')
    : null;
  
  const initial: TokenUsage = stored 
    ? JSON.parse(stored)
    : { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  const { subscribe, update, set } = writable<TokenUsage>(initial);

  // Save to sessionStorage on changes
  subscribe((value) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('tinyverse_token_usage', JSON.stringify(value));
    }
  });

  return {
    subscribe,
    reset: () => set({ promptTokens: 0, completionTokens: 0, totalTokens: 0 }),
    addUsage: (prompt: number, completion: number) => {
      update(current => ({
        promptTokens: current.promptTokens + prompt,
        completionTokens: current.completionTokens + completion,
        totalTokens: current.totalTokens + prompt + completion
      }));
    }
  };
}

export const tokenUsage = createTokenStore();
