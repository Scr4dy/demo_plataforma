
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WelcomeCard } from '../WelcomeCard';
import { useTheme } from '../../../context/ThemeContext';
import { ProgressCard } from '../ProgressCard';
import { CourseGrid } from '../CourseGrid';
import { CertificateCarousel } from '../CertificateCarousel';
import { AlertList } from '../AlertList';
import { TeamAlertsList } from '../TeamAlertsList';
import { QuickActionsBar } from '../QuickActionsBar';
import { ProgressSummary } from '../ProgressSummary';
import { DashboardStats } from '../DashboardStats';
import { WidgetsEditor } from '../WidgetsEditor';
import type { DashboardData, DashboardUIHelpers } from '../../../types/dashboard.types';

interface MobileDashboardLayoutProps extends DashboardUIHelpers {
  dashboardData: DashboardData;
  onCoursePress: (course: any) => void;
  onCertificatePress: (certificate: any) => void;
  onTeamAlertPress: (alert: any) => void;
  onAlertPress: (alert: any) => void;
  onSeeAllCertificates: () => void;
  onQuickAction: (action: any) => void;
  onShareProgress: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  isEmpty?: boolean;
  searchQuery?: string;
  activeFilters?: any;
  onSearchChange?: (query: string) => void;
  onFilterChange?: (filters: any) => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  searchResultsCount?: number;
  screenWidth?: number;
  
  
  viewMode?: 'grid' | 'list';
  sortBy?: string;
  favorites?: string[];
  toggleFavorite?: (id: string) => void;
  isFavorite?: (id: string) => boolean;
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  showHeader?: boolean;
}

export const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({
  dashboardData,
  onCoursePress,
  onCertificatePress,
  onTeamAlertPress,
  onAlertPress,
  onSeeAllCertificates,
  onQuickAction,
  onShareProgress,
  getStatusColor,
  getCourseIcon,
  getAlertIcon,
  getActionIcon,
  getDaysUntilExpiry,
  formatDate,
  refreshing = false,
  onRefresh,
  isEmpty = false,
  searchQuery,
  activeFilters,
  onSearchChange,
  onFilterChange,
  onResetFilters,
  hasActiveFilters = false,
  searchResultsCount = 0,
  screenWidth,
  
  
  viewMode = 'grid',
  sortBy = 'recent',
  favorites = [],
  toggleFavorite = () => {},
  isFavorite = () => false,
  selectedTab = 'all',
  onTabChange = () => {},
  showHeader = true
}) => {
  const [showWidgetsEditor, setShowWidgetsEditor] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const { theme, colors } = useTheme();
  
  const isIOS = Platform.OS === 'ios';
  const isSmallScreen = windowWidth < 375;

  const handleExploreCatalog = () => {
  };

  
  const renderContent = () => {
    if (isEmpty && !refreshing) {
      return (
        <View style={[
          styles.emptyContainer,
          isSmallScreen && styles.smallEmptyContainer
        ]}>
          <View style={[
            styles.emptyState,
            isSmallScreen && styles.smallEmptyState
          ]}>
            <Text style={[
              styles.emptyTitle,
              isSmallScreen && styles.smallEmptyTitle
            ]}>¡Bienvenido a tu Dashboard!</Text>
            <Text style={[
              styles.emptyMessage,
              isSmallScreen && styles.smallEmptyMessage
            ]}>
              Aún no tienes cursos asignados. Comienza tu journey de aprendizaje explorando nuestro catálogo de cursos disponibles.
            </Text>
            <TouchableOpacity 
              onPress={handleExploreCatalog}
              style={[
                styles.exploreButton,
                isSmallScreen && styles.smallExploreButton
              ]}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text style={[styles.exploreButtonText, { color: theme.colors.card }]}>
                Explorar Cursos Disponibles
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={isIOS ? undefined : ['#007AFF']}
              tintColor={isIOS ? "#007AFF" : undefined}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.widgetSection}>
          <WelcomeCard 
            name={dashboardData.name ?? ''}
            progress={dashboardData.progress ?? 0}
            onShareProgress={onShareProgress}
            isMobile={true}
          />
        </View>

        {}
        {dashboardData.quickActions && dashboardData.quickActions.length > 0 && (
          <View style={styles.widgetSection}>
            <QuickActionsBar 
              actions={dashboardData.quickActions}
              onActionPress={onQuickAction}
              getActionIcon={getActionIcon}
              isMobile={true}
            />
          </View>
        )}

        {}
        <View style={styles.widgetSection}>
          <ProgressCard progress={dashboardData.progress ?? 0} isMobile={true} />
        </View>

        {}
        {dashboardData.stats && (
          <View style={styles.widgetSection}>
            <DashboardStats stats={dashboardData.stats} isMobile={true} />
          </View>
        )}

        {}
        {dashboardData.courses && dashboardData.courses.length > 0 && (
          <View style={styles.widgetSection}>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                isSmallScreen && styles.smallSectionTitle
              ]}>Mis Cursos</Text>
              <View style={styles.mobileViewControls}>
                <Text style={styles.viewModeText}>
                  {viewMode === 'grid' ? 'Grid' : 'Lista'}
                </Text>
              </View>
            </View>
            <CourseGrid 
              courses={dashboardData.courses}
              onCoursePress={onCoursePress}
              getStatusColor={getStatusColor}
              getCourseIcon={getCourseIcon}
              getDaysUntilExpiry={getDaysUntilExpiry}
              isMobile={true}
              columns={1}
              
              viewMode={viewMode}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              sortBy={sortBy}
            />
          </View>
        )}

        {}
        {dashboardData.certificates && dashboardData.certificates.length > 0 && (
          <View style={styles.widgetSection}>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                isSmallScreen && styles.smallSectionTitle
              ]}>Certificados</Text>
              <TouchableOpacity 
                onPress={onSeeAllCertificates}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.seeAllText}>
                  Ver todos
                </Text>
              </TouchableOpacity>
            </View>
            <CertificateCarousel 
              certificates={dashboardData.certificates}
              onCertificatePress={onCertificatePress}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              getDaysUntilExpiry={getDaysUntilExpiry}
              isMobile={true}
            />
          </View>
        )}

        {}
        {dashboardData.alerts && dashboardData.alerts.length > 0 && (
          <View style={styles.widgetSection}>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                isSmallScreen && styles.smallSectionTitle
              ]}>Alertas Importantes</Text>
            </View>
            <AlertList 
              alerts={dashboardData.alerts}
              onAlertPress={onAlertPress}
              getAlertIcon={getAlertIcon}
              formatDate={formatDate}
              isMobile={true}
            />
          </View>
        )}

        {}
        {dashboardData.teamAlerts && dashboardData.teamAlerts.length > 0 && (
          <View style={styles.widgetSection}>
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                isSmallScreen && styles.smallSectionTitle
              ]}>Alertas del Equipo</Text>
            </View>
            <TeamAlertsList 
              alerts={dashboardData.teamAlerts}
              onTeamAlertPress={onTeamAlertPress}
              getAlertIcon={getAlertIcon}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              isMobile={true}
            />
          </View>
        )}

        {}
        {dashboardData.stats && (
          <View style={styles.widgetSection}>
            <ProgressSummary 
              completedCourses={dashboardData.stats.completedCourses ?? 0}
              totalCourses={dashboardData.stats.totalCourses ?? 0}
              averageProgress={dashboardData.stats.averageProgress ?? 0}
              isMobile={true}
            />
          </View>
        )}

        {}
        <View style={styles.footerSpace} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView edges={['top','left','right','bottom']} style={styles.safeArea}>
      {renderContent()}

      <WidgetsEditor
        isVisible={showWidgetsEditor}
        onClose={() => setShowWidgetsEditor(false)}
        isMobile={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  smallEmptyContainer: {
    padding: 16,
    minHeight: 300,
  },
  widgetSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  smallSectionTitle: {
    fontSize: 16,
  },
  mobileViewControls: {
    backgroundColor: '#e6fffa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#81e6d9',
  },
  viewModeText: {
    fontSize: 10,
    color: '#234e52',
    fontWeight: '600',
  },
  seeAllText: {
    color: '#2b6cb0',
    fontWeight: '500',
    fontSize: 14,
  },
  footerSpace: {
    height: 30,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  smallEmptyState: {
    padding: 24,
    margin: 16,
  },
  emptyStateText: {
    color: '#718096',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  smallEmptyTitle: {
    fontSize: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  smallEmptyMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 200,
  },
  smallExploreButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 180,
  },
  exploreButtonText: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MobileDashboardLayout;