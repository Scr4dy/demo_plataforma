
import { useState, useCallback } from 'react';

export interface AuthMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
  duration?: number;
}

export const useAuthForm = () => {
  const [message, setMessage] = useState<AuthMessage | null>(null);

  const setMessageWithTimeout = useCallback((newMessage: AuthMessage | null) => {
     
    setMessage(newMessage);

    if (newMessage?.duration) {
      setTimeout(() => {
        setMessage(null);
      }, newMessage.duration);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const showSuccess = useCallback((text: string, duration: number = 5000) => {
    setMessageWithTimeout({ type: 'success', text, duration });
  }, [setMessageWithTimeout]);

  const showError = useCallback((text: string, duration: number = 5000) => {
    setMessageWithTimeout({ type: 'error', text, duration });
  }, [setMessageWithTimeout]);

  const showWarning = useCallback((text: string, duration: number = 5000) => {
    setMessageWithTimeout({ type: 'warning', text, duration });
  }, [setMessageWithTimeout]);

  const showInfo = useCallback((text: string, duration: number = 5000) => {
    setMessageWithTimeout({ type: 'info', text, duration });
  }, [setMessageWithTimeout]);

  const showMessage = useCallback((type: 'success' | 'error' | 'warning' | 'info', text: string, duration: number = 5000) => {
    setMessageWithTimeout({ type, text, duration });
  }, [setMessageWithTimeout]);

  return {
    message,
    setMessage: setMessageWithTimeout,
    clearMessage,
    showMessage, 
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};