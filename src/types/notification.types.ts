

export type NotificationType = string;
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  isRead?: boolean;
  createdAt?: Date;
  data?: any;
}

export const NOTIFICATION_CONFIGS: Record<string, any> = {};

