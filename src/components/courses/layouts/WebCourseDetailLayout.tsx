
import React from 'react';
import { View, Text, StyleSheet, RefreshControl, Animated, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeScrollView } from '../../common/SafeScrollView';
import { CourseTabs } from '../CourseTabs';
import { CourseSidebar } from '../CourseSidebar';
import { ModuleCardWeb } from '../ModuleCardWeb';
import { ResourceCardWeb } from '../ResourceCardWeb';
import { DetailItemWeb } from '../DetailItemWeb';
import { DownloadAllResources } from '../DownloadAllResources';
import { CourseProgressTracker } from '../CourseProgressTracker';
import { EmptyState } from '../../common/EmptyState';
import { QuickActionsBar } from '../QuickActionsBar';
import type { CourseDetail, CourseActions, CourseUIHelpers, Module } from '../../../types/course.types';

interface WebCourseDetailLayoutProps {
  courseData: CourseDetail;
  activeTab: 'modules' | 'resources' | 'details';
  onTabChange: (tab: 'modules' | 'resources' | 'details') => void;
  nextModule?: Module;
  refreshing?: boolean;
  onRefresh?: () => void;
  onDownloadAllResources?: () => void;
  downloadProgress?: Record<string, number>;
  courseStats?: any;
  isDownloadingAll?: boolean;
  onModulePress?: (module?: Module) => void;  onLessonPress?: (lesson: any, module?: Module) => void;  onResourceDownload?: (resource?: any, resourceName?: string) => void;
  onStartExam?: (moduleId?: string) => void;
  onContinueLearning?: (module?: Module | string) => void;
  getStatusIcon?: (status: string | number) => string;
  getStatusText?: (status: string | number) => string;
  getStatusColor?: (status: string | number) => string;
  getResourceIcon?: (type?: string) => string;
}

export const WebCourseDetailLayout: React.FC<WebCourseDetailLayoutProps> = React.memo(({
  courseData,
  activeTab,
  onTabChange,
  nextModule,
  onModulePress,
  onLessonPress,
  onResourceDownload,
  onStartExam,
  onContinueLearning,
  onDownloadAllResources,
  getStatusIcon,
  getStatusText,
  getStatusColor,
  getResourceIcon,
  refreshing = false,
  onRefresh,
  downloadProgress = {},
  courseStats,
  isDownloadingAll = false
}) => {
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const getCourseStatusColor = (progress: number): string => {
    if (progress === 100) return '#38a169';
    if (progress > 0) return '#d69e2e';
    return '#2b6cb0';
  };

  const getCourseStatusText = (progress: number): string => {
    if (progress === 100) return 'Completado';
    if (progress > 0) return 'En Progreso';
    return 'No Iniciado';
  };

  const renderHeroSection = () => (
    <View style={styles.heroContent}>
      <View style={[styles.statusBadge, { backgroundColor: getCourseStatusColor(courseData.progress ?? 0) }]}>
        <Text style={styles.statusText}>{getCourseStatusText(courseData.progress ?? 0)}</Text>
      </View>
      <Text style={styles.courseTitle}>{courseData.title}</Text>
      <Text style={styles.courseDescription}>{courseData.description}</Text>
      
      <View style={styles.heroStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="schedule" size={16} color="#718096" />
          <Text style={styles.statText}>{courseData.duration ?? ''}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="library-books" size={16} color="#718096" />
          <Text style={styles.statText}>{courseStats?.totalModules || 0} módulos</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="school" size={16} color="#718096" />
          <Text style={styles.statText}>{courseData.level ?? ''}</Text>
        </View>
      </View>
    </View>
  );

  const renderModules = () => (
    <View style={styles.modulesSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Contenido del Curso</Text>
          <Text style={styles.sectionSubtitle}>
            {courseStats?.completedModules || 0} de {courseStats?.totalModules || 0} módulos completados 
            ({courseStats?.completionRate || 0}%)
          </Text>
        </View>
        
        {courseStats?.completionRate && courseStats.completionRate < 100 && nextModule && (
          <Text style={styles.continueLearningHint}>
            Continúa con: {nextModule.title}
          </Text>
        )}
      </View>
      
        {courseData.modules.length > 0 ? (
        <View style={styles.modulesList}>
          {courseData.modules.map((module) => (
            <ModuleCardWeb
              key={module.id}
              module={module}
              onModulePress={onModulePress}
              onLessonPress={onLessonPress}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              getStatusColor={getStatusColor}
              getResourceIcon={getResourceIcon}
              isNextModule={module.id === nextModule?.id}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No hay módulos disponibles"
          message="Este curso no tiene contenido modular aún"
          icon="library-books"
        />
      )}
    </View>
  );

  const renderResources = () => (
    <View style={styles.resourcesSection}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Recursos de Aprendizaje</Text>
          <Text style={styles.sectionSubtitle}>
            Material complementario para apoyar tu aprendizaje
          </Text>
        </View>
        
        {courseData.resources.length > 0 && onDownloadAllResources && (
          <DownloadAllResources
            resourceCount={courseData.resources.length}
            onDownloadAll={onDownloadAllResources}
          />
        )}
      </View>
      
      {courseData.resources.length > 0 ? (
        <View style={styles.resourcesGridWeb}>
          {courseData.resources.map((resource) => (
            <ResourceCardWeb
              key={resource.id}
              resource={resource}
              onResourceDownload={onResourceDownload}
              getResourceIcon={getResourceIcon}
              showDownloadProgress={true}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No hay recursos disponibles"
          message="Este curso no tiene material complementario"
          icon="attach-file"
        />
      )}
    </View>
  );

  const renderDetails = () => (
    <View style={styles.detailsSection}>
      <Text style={styles.sectionTitle}>Información del Curso</Text>
      
      <View style={styles.detailsGridWeb}>
        <DetailItemWeb 
          icon="person"
          label="Instructor"
          value={courseData.instructor ?? ''}
          highlight={true}
        />
        <DetailItemWeb 
          icon="category"
          label="Categoría"
          value={courseData.category ?? ''}
        />
        <DetailItemWeb 
          icon="school"
          label="Nivel"
          value={courseData.level ?? ''}
        />
        <DetailItemWeb 
          icon="schedule"
          label="Duración Total"
          value={courseData.duration ?? ''}
        />
        <DetailItemWeb 
          icon="trending-up"
          label="Progreso Actual"
          value={`${courseData.progress}%`}
          highlight={courseData.progress === 100}
        />
        <DetailItemWeb 
          icon="calendar"
          label="Fecha de Vencimiento"
          value={courseData.expiryDate || 'No especificada'}
          warning={isExpiringSoon(courseData.expiryDate ?? undefined)}
        />
        <DetailItemWeb 
          icon="library-books"
          label="Módulos Completados"
          value={`${courseStats?.completedModules || 0}/${courseStats?.totalModules || 0}`}
        />
        <DetailItemWeb 
          icon="download"
          label="Recursos Disponibles"
          value={(courseStats?.totalResources || 0).toString()}
        />
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Descripción del Curso</Text>
        <Text style={styles.infoCardText}>
          {courseData.description}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Objetivos de Aprendizaje</Text>
        <View style={styles.objectivesList}>
          {courseData.objectives?.map((objective, index) => (
            <View key={index} style={styles.objectiveItem}>
              <Text style={styles.objectiveBullet}>•</Text>
              <Text style={styles.objectiveText}>{objective}</Text>
            </View>
          ))}
        </View>
      </View>

      {courseData.requirements && courseData.requirements.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Requisitos Previos</Text>
          <View style={styles.objectivesList}>
            {courseData.requirements.map((requirement, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Text style={styles.objectiveBullet}>•</Text>
                <Text style={styles.objectiveText}>{requirement}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.webContainer}>
      {}
      <Animated.View 
        style={[
          styles.webHeader,
          {
            opacity: headerOpacity,
            transform: [{ scale: headerScale }]
          }
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.webTitle}>{courseData.title}</Text>
          <Text style={styles.webSubtitle}>Por {courseData.instructor}</Text>
        </View>
        
        <CourseProgressTracker
          progress={courseData.progress ?? 0}
          completedModules={courseStats?.completedModules || 0}
          totalModules={courseStats?.totalModules || 0}
          size="compact"
        />
      </Animated.View>

      <SafeScrollView 
        style={styles.webContent}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          ) : undefined
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.heroSection}>
          {renderHeroSection()}
          
          <CourseSidebar
            courseData={courseData}
            nextModule={nextModule}
            onContinueLearning={onContinueLearning ?? (() => {})}
            onStartExam={onStartExam ?? (() => {})}
          />
        </View>

        <QuickActionsBar
          courseData={courseData}
          onContinueLearning={onContinueLearning ?? (() => {})}
          onStartExam={onStartExam ?? (() => {})}
          nextModule={nextModule}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        <CourseTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          modulesCount={courseData.modules.length}
          resourcesCount={courseData.resources.length}
          showBadges={true}
        />

        <View style={styles.tabContent}>
          {activeTab === 'modules' && renderModules()}
          {activeTab === 'resources' && renderResources()}
          {activeTab === 'details' && renderDetails()}
        </View>

        <View style={styles.footerSpace} />
      </SafeScrollView>
    </View>
  );
});

const isExpiringSoon = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  
  try {
    const months: { [key: string]: number } = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    
    const parts = expiryDate.split(' ');
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[2].toLowerCase()];
      const year = parseInt(parts[4]);
      
      const expiry = new Date(year, month, day);
      const today = new Date();
      const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDiff <= 7 && daysDiff > 0;
    }
    return false;
  } catch {
    return false;
  }
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  } as any,
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    position: 'relative',
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
  },
  webTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 2,
  },
  webSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  webContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  } as any,
  heroSection: {
    flexDirection: 'row',
    padding: 24,
    justifyContent: 'space-between',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  heroContent: {
    flex: 2,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#718096',
  },
  tabContent: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    minHeight: 400,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  continueLearningHint: {
    fontSize: 12,
    color: '#2b6cb0',
    backgroundColor: '#ebf8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontWeight: '500',
  },
  modulesSection: {
    flex: 1,
  },
  modulesList: {
    
  },
  resourcesSection: {
    flex: 1,
  },
  resourcesGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailsSection: {
    gap: 24,
  },
  detailsGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  infoCardText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  objectivesList: {
    gap: 8,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  objectiveBullet: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  objectiveText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
    flex: 1,
  },
  footerSpace: {
    height: Platform.OS === 'web' ? 100 : 40,
  },
});

export default WebCourseDetailLayout;