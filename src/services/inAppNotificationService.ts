

export const createNotification = async (..._args: any[]): Promise<null> => null;
export const getNotifications = async (): Promise<any[]> => [];
export const markAsRead = async (_id?: string) => {};
export const markAllAsRead = async () => {};
export const deleteNotification = async (_id?: string) => {};
export const clearReadNotifications = async () => {};
export const clearAllNotifications = async () => {};
export const getUnreadCount = async (): Promise<number> => 0;
export const getNotificationsByType = async (_t?: any): Promise<any[]> => [];
export const getNotificationsByPriority = async (_p?: any): Promise<any[]> => [];
export const createSampleNotifications = async (): Promise<void> => {};

