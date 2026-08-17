import React, { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notify = () => {
  toastListeners.forEach(listener => listener([...toasts]));
};

export const toast = {
  success: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, message, type: 'success' }];
    notify();
    setTimeout(() => toast.remove(id), 4000);
  },
  error: (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, message, type: 'error' }];
    notify();
    setTimeout(() => toast.remove(id), 5000);
  },
  remove: (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }
};

export const useToasts = () => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    toastListeners.push(setCurrentToasts);
    return () => {
      toastListeners = toastListeners.filter(l => l !== setCurrentToasts);
    };
  }, []);

  return currentToasts;
};
