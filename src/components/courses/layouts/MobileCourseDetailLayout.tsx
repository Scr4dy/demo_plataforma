
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeScrollView } from '../../common/SafeScrollView';
import { EmptyState } from '../../common/EmptyState';
import { useTheme } from '../../../context/ThemeContext';
import type { CourseDetail, CourseUIHelpers, CourseActions, Module } from '../../../types/course.types';

interface MobileCourseDetailLayoutProps {
  courseData: CourseDetail;
  activeTab?: 'modules' | 'resources' | 'details';
  onTabChange?: (tab: 'modules' | 'resources' | 'details') => void;
  nextModule?: any;
  refreshing?: boolean;
  onRefresh?: () => void;
  isOnline?: boolean;
  onResourceDownload?: (resourceId: string, resourceName: string) => void;
  onStartExam?: () => void;
  onContinueLearning?: (module?: any) => void;
  getResourceIcon?: (resourceType: string) => string;
  onModulePress?: (module?: Module) => void;
  getStatusIcon?: (status: string | number) => string;
  getStatusText?: (status: string | number) => string;
  getStatusColor?: (status: string | number) => string;
  courseStats?: any;
  isDownloadingAll?: boolean;
}

const { width } = Dimensions.get('window');

export const MobileCourseDetailLayout: React.FC<MobileCourseDetailLayoutProps> = React.memo(({
  courseData,
  onModulePress,
  getStatusIcon,
  getStatusText,
  getStatusColor,
  getResourceIcon,
  activeTab = 'modules',
  onTabChange,
  nextModule,
  refreshing = false,
  onRefresh,
  isOnline = true,
  onResourceDownload,
  onStartExam,
  onContinueLearning,
  courseStats,
  isDownloadingAll = false
}) => {
  const { theme, colors } = useTheme();
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {(['modules', 'resources', 'details'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => onTabChange?.(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab === 'modules' && `Módulos`}
            {tab === 'resources' && `Recursos`}
            {tab === 'details' && 'Detalles'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderModules = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Contenido del Curso</Text>
          <Text style={styles.sectionSubtitle}>
            {courseStats?.completedModules || 0} de {courseStats?.totalModules || 0} módulos completados
          </Text>
        </View>
        {nextModule && (
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => onContinueLearning?.(nextModule)}
          >
            <MaterialIcons name="play-arrow" size={16} color="white" />
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
        )}
      </View>

      {courseData.modules.map((module, index) => (
        <TouchableOpacity
          key={module.id}
          style={[
            styles.moduleCard,
            module.status === 'locked' && styles.moduleLocked,
            nextModule?.id === module.id && styles.nextModuleCard
          ]}
          onPress={() => onModulePress?.(module)}
          disabled={module.status === 'locked'}
        >
          <View style={styles.moduleHeader}>
            <View style={styles.moduleLeft}>
              <View style={[
                styles.moduleNumber,
                module.status === 'completed' && styles.moduleNumberCompleted,
                module.status === 'in-progress' && styles.moduleNumberInProgress
              ]}>
                <Text style={styles.moduleNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDuration}>{module.duration}</Text>
              </View>
            </View>
            <View style={styles.moduleRight}>
              {module.status !== 'locked' && (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor?.(module.status ?? '') ?? colors.primary }]}>
                  <Text style={styles.statusText}>{getStatusText?.(module.status ?? '') ?? ''}</Text>
                </View>
              )}
              <MaterialIcons 
                name={module.status === 'locked' ? 'lock' : 'chevron-right'} 
                size={20} 
                color={module.status === 'locked' ? '#a0aec0' : '#4a5568'} 
              />
            </View>
          </View>

          {module.status === 'in-progress' && (module.progress || 0) > 0 ? (
            <View style={styles.moduleProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${module.progress ?? 0}%`, backgroundColor: getStatusColor?.(module.status ?? '') ?? colors.primary }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{module.progress}%</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResources = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recursos de Aprendizaje</Text>
      <Text style={styles.sectionSubtitle}>
        Material complementario para el curso
      </Text>

      {courseData.resources?.map((resource) => (
        <TouchableOpacity
          key={resource.id}
          style={styles.resourceCard}
          onPress={() => onResourceDownload?.(resource.id, resource.name ?? '')}
        >
          <View style={styles.resourceLeft}>
            <MaterialIcons 
              name={getResourceIcon?.(resource.type ?? '') as any || 'insert-drive-file'} 
              size={24} 
              color="#2b6cb0" 
            />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceName}>{resource.name}</Text>
              <Text style={styles.resourceType}>{resource.type} • {resource.size}</Text>
            </View>
          </View>
          <MaterialIcons name="download" size={20} color="#4a5568" />
        </TouchableOpacity>
      ))}

      {(!courseData.resources || courseData.resources.length === 0) && (
        <EmptyState
          title="No hay recursos"
          message="Este curso no tiene material complementario"
          icon="attach-file"
        />
      )}
    </View>
  );

  const renderDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información del Curso</Text>

      {}
      <View style={styles.courseInfoMobile}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#718096" />
          <Text style={styles.infoLabel}>Instructor:</Text>
          <Text style={styles.infoValue}>{courseData.instructor}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="category" size={16} color="#718096" />
          <Text style={styles.infoLabel}>Categoría:</Text>
          <Text style={styles.infoValue}>{courseData.category}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="school" size={16} color="#718096" />
          <Text style={styles.infoLabel}>Nivel:</Text>
          <Text style={styles.infoValue}>{courseData.level}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="schedule" size={16} color="#718096" />
          <Text style={styles.infoLabel}>Duración:</Text>
          <Text style={styles.infoValue}>{courseData.duration}</Text>
        </View>
      </View>

      <View style={styles.infoCards}>
        <View style={styles.infoCard}>
          <MaterialIcons name="trending-up" size={20} color="#2b6cb0" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Progreso Actual</Text>
            <Text style={styles.infoValue}>{courseData.progress}%</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="library-books" size={20} color="#2b6cb0" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Módulos Completados</Text>
            <Text style={styles.infoValue}>
              {courseStats?.completedModules || 0}/{courseStats?.totalModules || 0}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionTitle}>Descripción</Text>
        <Text style={styles.descriptionText}>{courseData.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeScrollView 
        style={styles.scrollView}
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
      >
        {}
        
        {renderTabs()}

        {activeTab === 'modules' && renderModules()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'details' && renderDetails()}

        <View style={styles.footerSpace} />
      </SafeScrollView>

      {nextModule && activeTab === 'modules' && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => onContinueLearning?.(nextModule)}
        >
          <MaterialIcons name="play-arrow" size={24} color="white" />
          <Text style={styles.fabText}>Continuar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2b6cb0',
  },
  tabText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#2b6cb0',
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  moduleCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextModuleCard: {
    borderWidth: 2,
    borderColor: '#2b6cb0',
  },
  moduleLocked: {
    opacity: 0.6,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberCompleted: {
    backgroundColor: '#48bb78',
  },
  moduleNumberInProgress: {
    backgroundColor: '#ed8936',
  },
  moduleNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  moduleDuration: {
    fontSize: 12,
    color: '#718096',
  },
  moduleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  moduleProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '500',
    minWidth: 24,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 2,
  },
  resourceType: {
    fontSize: 12,
    color: '#718096',
  },
  
  courseInfoMobile: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#718096',
    marginRight: 4,
    minWidth: 70,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    flex: 1,
  },
  infoCards: {
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  footerSpace: {
    height: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MobileCourseDetailLayout;