import { writable } from 'svelte/store';

interface LoadingState {
  [key: string]: boolean;
}

function createLoadingStore() {
  const { subscribe, update } = writable<LoadingState>({});

  return {
    subscribe,
    
    start(key: string) {
      update(state => ({ ...state, [key]: true }));
    },
    
    stop(key: string) {
      update(state => {
        const newState = { ...state };
        delete newState[key];
        return newState;
      });
    },
    
    isLoading(key: string): boolean {
      let loading = false;
      subscribe(state => {
        loading = state[key] || false;
      })();
      return loading;
    },
    
    async wrap<T>(key: string, promise: Promise<T>): Promise<T> {
      this.start(key);
      try {
        return await promise;
      } finally {
        this.stop(key);
      }
    }
  };
}

export const loadingStore = createLoadingStore();
