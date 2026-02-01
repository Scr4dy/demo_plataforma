
import { supabase } from '../config/supabase';

export interface NotificationData {
  
  [key: string]: any;
}

export const notificationService = {
  async notifyUserRegistration(_data: any): Promise<boolean> { return true; },

  async notifyCourseCompletion(data: { userId: string; courseId: number; courseTitle: string; userName: string }): Promise<boolean> {
    try {
      

      const { data: response, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'course_completion',
          data: {
            userName: data.userName,
            courseTitle: data.courseTitle,
            completedAt: new Date().toISOString()
          }
        }
      });

      if (error) {
        
        });
        :', error.message || error);
        
        return true; 
      }

      
      return true;
    } catch (err) {
      
      return false;
    }
  },

  async notifyCertificateIssued(data: { usuario: any; curso: any }): Promise<boolean> {
    
    
    return true;
  },
  async sendEmailNotification(_notification: any): Promise<boolean> { return true; },
};

export default notificationService;
