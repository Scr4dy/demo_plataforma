
export interface TeamMember {
  id: number;
  name: string;
  position: string;
  status: 'active' | 'inactive';
  certifications: Certification[];
  evaluations: Evaluation[];
  lastTraining: string;
}

export interface Certification {
  name: string;
  status: 'in-progress' | 'active' | 'expired' | string;
  expires?: string;
  progress?: number;
}

export interface Evaluation {
  type: string;
  status: 'pending' | 'completed' | string;
  date?: string;
}

export interface PendingAction {
  id: number;
  type: 'evaluation' | 'certification' | 'training' | 'documentation';
  count: number;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Alert {
  id: number;
  type: 'urgent' | 'warning' | 'info';
  message: string;
  member: string;
}

export interface TeamData {
  department: string;
  totalMembers: number;
  members: TeamMember[];
  pendingActions: PendingAction[];
  alerts: Alert[];
}

export interface TeamScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export interface QuickAction {
  id: string | number;
  type?: string;
  label?: string;
  icon?: string;
}

export interface TeamAlert {
  id: string | number;
  type?: string;
  message?: string;
  timestamp?: string | Date;
  status?: 'active' | 'pending' | 'resolved' | string;
  assignedTo?: string;
  teamName?: string;
}