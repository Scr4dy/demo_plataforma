import { KeyboardTypeOptions } from 'react-native';

export interface AlertMessage {
  type: 'success' | 'error';
  text: string;
}

export interface CustomInputProps {
  label: string;
  iconName: string;
  iconType: 'ionicons' | 'material' | 'feather' | 'fontawesome';
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  toggleVisibility?: () => void;
  isVisible?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  placeholder?: string;
  error?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  employeeId: string;
  password: string;
  confirmPassword: string;
}

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  CourseDetail: { courseId: string };
  CertificateDetail: { certificate: any };
  ExamScreen: { examId: string };
  ModuleContent: { module: any };
  MemberProfile: { member: any };
  ChangePassword: undefined;
  NotificationsSettings: undefined;
  LanguageSettings: undefined;
  HelpSupport: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Categories: undefined;
  Evaluation: undefined;
  Certificates: undefined;
  Team: undefined;
  Profile: undefined;
  AdminDashboard?: undefined;
  Instructor?: undefined;
};