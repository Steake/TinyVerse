import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    
    show(type: ToastType, message: string, duration: number = 5000) {
      const id = crypto.randomUUID();
      const toast: Toast = { id, type, message, duration };
      
      update(toasts => [...toasts, toast]);
      
      if (duration > 0) {
        setTimeout(() => {
          this.dismiss(id);
        }, duration);
      }
      
      return id;
    },
    
    success(message: string, duration?: number) {
      return this.show('success', message, duration);
    },
    
    error(message: string, duration?: number) {
      return this.show('error', message, duration);
    },
    
    info(message: string, duration?: number) {
      return this.show('info', message, duration);
    },
    
    warning(message: string, duration?: number) {
      return this.show('warning', message, duration);
    },
    
    dismiss(id: string) {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    
    clear() {
      update(() => []);
    }
  };
}

export const toastStore = createToastStore();
