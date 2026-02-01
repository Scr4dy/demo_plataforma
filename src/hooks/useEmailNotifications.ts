
import { useState } from 'react';
import { Alert } from 'react-native';

export const useEmailNotifications = () => {
  const [sending, setSending] = useState(false);

  const notifyAdminUserRegistration = async (userData: any, courseData?: any) => {
    setSending(true);
    try {
      
      const response = await fetch('/api/notifications/admin/user-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userData,
          course: courseData,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
      }
    } catch (error) {
      
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    notifyAdminUserRegistration
  };
};