import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  
  Onboarding: undefined;
  Login: undefined;

  
  MobileTabs: undefined;
  MainTabs: undefined;

  
  Dashboard: undefined;
  Courses: undefined;
  Certificates: undefined;
  Profile: undefined;
  CourseDetail: {
    courseId: string;
    certificateTitle?: string;
    courseTitle?: string;
    courseCategory?: string;
    adminMode?: boolean;
    isInProgress?: boolean;
    isRenewal?: boolean;
  };
  CourseRenewal: {
    certificateId: string;
    certificateTitle: string;
  };
  Evaluation: {
    courseId?: string;
    certificateId?: string;
  };
  Team: undefined;
  Categories: { initialCategory?: string } | undefined;
  GlobalSearch: undefined;
  ProfileSettings: undefined;
  AllCourses: undefined;
  AdminCourses: { editCourseId?: number; adminMode?: boolean } | undefined;
  Modules?: { courseId?: number };
  Lessons?: { courseId?: number };
  MyCourses: undefined;
  UserForm: { userId: string } | undefined;
  AdminUsers: { adminMode?: boolean } | undefined;
  AdminCategories: { adminMode?: boolean } | undefined;
  AdminDashboard: undefined;
  QuizManagement?: { contentId: number; contentTitle: string } | undefined;

  
  CertificatePreview: {
    certificateId: string;
    downloadUrl?: string;
  };

  
  NotFound: {
    message?: string;
    suggestedAction?: string;
  };
  NetworkError: undefined;

  
  LessonDetail: {
    courseId: string;
    moduleId: string;
    content: any; 
    moduleTitle?: string;
    contentTitle?: string;
    moduleLessons?: any[];
  };
};

export type StackNavigationProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};

export type CertificatesScreenProps = StackNavigationProps<'Certificates'>;
export type CourseDetailScreenProps = StackNavigationProps<'CourseDetail'>;
export type CertificatePreviewScreenProps = StackNavigationProps<'CertificatePreview'>;
export type EvaluationScreenProps = StackNavigationProps<'Evaluation'>;
export type DashboardScreenProps = StackNavigationProps<'Dashboard'>;
export type CoursesScreenProps = StackNavigationProps<'Courses'>;
export type ProfileScreenProps = StackNavigationProps<'Profile'>;
export type TeamScreenProps = StackNavigationProps<'Team'>;
export type LoginScreenProps = StackNavigationProps<'Login'>;
export type OnboardingScreenProps = StackNavigationProps<'Onboarding'>;