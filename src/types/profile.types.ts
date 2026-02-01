export interface Profile {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  avatar?: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive';
  stats: {
    completedTasks: number;
    pendingTasks: number;
    certifications: number;
    evaluations: number;
  };
  certifications: Certification[];
  skills: string[];
  recentActivity: Activity[];
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  position?: string;
  department?: string;
  phone?: string;
  avatar?: string;
}

export interface Certification {
  id: string;
  name: string;
  status: 'active' | 'expired' | 'pending';
  issueDate: string;
  expiryDate?: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface ProfileScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
  route?: {
    params?: {
      member?: any;
    };
  };
}