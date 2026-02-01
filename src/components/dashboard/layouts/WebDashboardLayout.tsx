
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Dimensions,
  FlatList
} from 'react-native';
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
import { WidgetsGrid } from '../WidgetsGrid';
import { WidgetsEditor } from '../WidgetsEditor';
import type { DashboardData, DashboardUIHelpers } from '../../../types/dashboard.types';

interface WebDashboardLayoutProps extends DashboardUIHelpers {
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
  isTablet?: boolean;
  screenWidth?: number;
  isMobileWeb?: boolean;
  
  
  viewMode?: 'grid' | 'list';
  sortBy?: string;
  favorites?: string[];
  toggleFavorite?: (id: string) => void;
  isFavorite?: (id: string) => boolean;
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  showHeader?: boolean;
}

interface WidgetItem {
  id: string;
  type: 'widget';
  widgetConfig: any;
}

export const WebDashboardLayout: React.FC<WebDashboardLayoutProps> = ({
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
  isTablet = false,
  screenWidth = Dimensions.get('window').width,
  isMobileWeb = false,
  
  
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  
  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';
  const { theme, colors } = useTheme();

  
  
  const { useSidebar } = require('../../../context/SidebarContext') as any;
  const sidebarCtx = useSidebar ? useSidebar() : null;
  const sidebarOpen = !!(sidebarCtx && sidebarCtx.isSidebarOpen);
  const sidebarWidth = sidebarOpen ? 250 : 80;
  const effectiveContentWidth = Math.max(windowWidth - sidebarWidth, 320);

  
  const isLargeDesktop = effectiveContentWidth >= 1440;
  const isDesktop = effectiveContentWidth >= 1200 && effectiveContentWidth < 1440;
  const isSmallDesktop = effectiveContentWidth >= 1024 && effectiveContentWidth < 1200;
  const isTabletLandscape = effectiveContentWidth >= 768 && effectiveContentWidth < 1024;
  const isTabletPortrait = effectiveContentWidth >= 768 && effectiveContentWidth < 1024 && windowHeight > windowWidth;
  const isMobile = effectiveContentWidth < 768;
  const isSmallMobile = effectiveContentWidth < 425;
  const isVerySmallMobile = effectiveContentWidth < 375;
  const isTinyScreen = effectiveContentWidth < 320;

  
  const effectiveIsMobileWeb = isMobileWeb || (isWeb && isMobile);
  const effectiveIsTablet = isTablet || (isWeb && isTabletLandscape);

  
  const getGridConfig = () => {
    if (isTinyScreen) return { columns: 1, gap: 8, padding: 8 };
    if (isVerySmallMobile) return { columns: 1, gap: 10, padding: 10 };
    if (isSmallMobile) return { columns: 1, gap: 12, padding: 12 };
    if (isMobile) return { columns: 1, gap: 16, padding: 16 };
    if (isTabletPortrait) return { columns: 2, gap: 16, padding: 16 };
    if (isTabletLandscape) return { columns: 2, gap: 20, padding: 20 };
    if (isSmallDesktop) return { columns: 2, gap: 20, padding: 20 };
    if (isDesktop) return { columns: 3, gap: 24, padding: 24 };
    if (isLargeDesktop) return { columns: 3, gap: 24, padding: 24 };
    return { columns: 3, gap: 24, padding: 24 };
  };

  const { columns, gap, padding } = getGridConfig();

  
  const flatListKey = `web-dashboard-${columns}-columns`;

  
  const { listData } = useMemo(() => {
    const data: WidgetItem[] = [];

    
    const virtualizedWidgets = [
      { id: 'courses' },
      { id: 'certificates' },
      { id: 'alerts' },
      { id: 'teamAlerts' }
    ].filter(widget => {
      
      switch (widget.id) {
        case 'courses': 
          return dashboardData.courses?.length > 0;
        case 'certificates': 
          return dashboardData.certificates?.length > 0;
        case 'alerts': 
          return (dashboardData.alerts?.length ?? 0) > 0;
        case 'teamAlerts': 
          return (dashboardData.teamAlerts?.length ?? 0) > 0;
        default: 
          return false;
      }
    });

    virtualizedWidgets.forEach(widget => {
      data.push({ id: widget.id, type: 'widget', widgetConfig: widget });
    });

    return { listData: data };
  }, [dashboardData]);

  const handleExploreCatalog = () => {
  };

  
  const renderWidget = (widgetConfig: any) => {
    const commonProps = {
      getStatusColor,
      getCourseIcon,
      getAlertIcon,
      getActionIcon,
      getDaysUntilExpiry,
      formatDate,
      isMobile: effectiveIsMobileWeb
    };

    const widgetContent = (() => {
      switch (widgetConfig.id) {
        case 'welcome':
          return (
            <WelcomeCard 
              name={dashboardData.name ?? ''}
              progress={dashboardData.progress ?? 0}
              onShareProgress={onShareProgress}
              isMobile={effectiveIsMobileWeb}
            />
          );

        case 'quickActions':
          return dashboardData.quickActions && dashboardData.quickActions.length > 0 ? (
            <QuickActionsBar 
              actions={dashboardData.quickActions}
              onActionPress={onQuickAction}
              getActionIcon={getActionIcon}
              isMobile={effectiveIsMobileWeb}
            />
          ) : null;

        case 'progress':
          return (
            <ProgressCard 
              progress={dashboardData.progress ?? 0} 
              isMobile={effectiveIsMobileWeb}
            />
          );

        case 'stats':
          return dashboardData.stats ? (
            <DashboardStats 
              stats={dashboardData.stats} 
              isMobile={effectiveIsMobileWeb}
            />
          ) : null;

        case 'courses':
          return dashboardData.courses && dashboardData.courses.length > 0 ? (
            <>
              <View style={[
                styles.sectionHeader,
                effectiveIsMobileWeb && styles.mobileSectionHeader
              ]}>
                <Text style={[
                  styles.sectionTitle,
                  effectiveIsMobileWeb && styles.mobileSectionTitle,
                  isVerySmallMobile && styles.verySmallSectionTitle
                ]}>
                  Mis Cursos
                </Text>
                {}
                <View style={styles.headerControls}>
                  {selectedTab && (
                    <View style={styles.tabControls}>
                      <Text style={styles.tabText}>Filtro: {selectedTab}</Text>
                    </View>
                  )}
                  {viewMode && (
                    <View style={styles.viewControls}>
                      <Text style={styles.viewModeText}>
                        {viewMode === 'grid' ? 'Vista: Grid' : 'Vista: Lista'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <CourseGrid 
                courses={dashboardData.courses}
                onCoursePress={onCoursePress}
                getStatusColor={getStatusColor}
                getCourseIcon={getCourseIcon}
                getDaysUntilExpiry={getDaysUntilExpiry}
                isMobile={effectiveIsMobileWeb}
                columns={effectiveIsMobileWeb ? 1 : (effectiveIsTablet ? 2 : 3)}
                
                viewMode={viewMode}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                sortBy={sortBy}
              />
            </>
          ) : (
            <>
              <View style={[
                styles.sectionHeader,
                effectiveIsMobileWeb && styles.mobileSectionHeader
              ]}>
                <Text style={[
                  styles.sectionTitle,
                  effectiveIsMobileWeb && styles.mobileSectionTitle
                ]}>
                  Mis Cursos
                </Text>
              </View>
              <View style={[
                styles.emptyState,
                effectiveIsMobileWeb && styles.mobileEmptyState
              ]}>
                <Text style={[
                  styles.emptyStateText,
                  effectiveIsMobileWeb && styles.mobileEmptyStateText
                ]}>
                  No hay cursos disponibles
                </Text>
              </View>
            </>
          );

        case 'certificates':
          return dashboardData.certificates && dashboardData.certificates.length > 0 ? (
            <>
              <View style={[
                styles.sectionHeader,
                effectiveIsMobileWeb && styles.mobileSectionHeader
              ]}>
                <Text style={[
                  styles.sectionTitle,
                  effectiveIsMobileWeb && styles.mobileSectionTitle,
                  isVerySmallMobile && styles.verySmallSectionTitle
                ]}>
                  Certificados
                </Text>
                <TouchableOpacity 
                  onPress={onSeeAllCertificates}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[
                    styles.seeAllText,
                    effectiveIsMobileWeb && styles.mobileSeeAllText
                  ]}>
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
                isMobile={effectiveIsMobileWeb}
              />
            </>
          ) : (
            <>
              <View style={[
                styles.sectionHeader,
                effectiveIsMobileWeb && styles.mobileSectionHeader
              ]}>
                <Text style={[
                  styles.sectionTitle,
                  effectiveIsMobileWeb && styles.mobileSectionTitle
                ]}>
                  Certificados
                </Text>
              </View>
              <View style={[
                styles.emptyState,
                effectiveIsMobileWeb && styles.mobileEmptyState
              ]}>
                <Text style={[
                  styles.emptyStateText,
                  effectiveIsMobileWeb && styles.mobileEmptyStateText
                ]}>
                  No hay certificados
                </Text>
              </View>
            </>
          );

        case 'alerts':
          return dashboardData.alerts && dashboardData.alerts.length > 0 ? (
            <>
              <View style={[
                styles.sectionHeader,
                effectiveIsMobileWeb && styles.mobileSectionHeader
              ]}>
                <Text style={[
                  styles.sectionTitle,
                  effectiveIsMobileWeb && styles.mobileSectionTitle,
                  isVerySmallMobile && styles.verySmallSectionTitle
                ]}>
                  Alertas Importantes
                </Text>
              </View>
              <AlertList 
                alerts={dashboardData.alerts}
                onAlertPress={onAlertPress}
                getAlertIcon={getAlertIcon}
                formatDate={formatDate}
                isMobile={effectiveIsMobileWeb}
              />
            </>
          ) : null;

        case 'teamAlerts':
          return dashboardData.teamAlerts && dashboardData.teamAlerts.length > 0 ? (
            <>
              <View style={[
                styles.sectionHeader,
                effectiveIsMobileWeb && styles.mobileSectionHeader
              ]}>
                <Text style={[
                  styles.sectionTitle,
                  effectiveIsMobileWeb && styles.mobileSectionTitle,
                  isVerySmallMobile && styles.verySmallSectionTitle
                ]}>
                  Alertas del Equipo
                </Text>
              </View>
              <TeamAlertsList 
                alerts={dashboardData.teamAlerts}
                onTeamAlertPress={onTeamAlertPress}
                getAlertIcon={getAlertIcon}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                isMobile={effectiveIsMobileWeb}
              />
            </>
          ) : null;

        case 'progressSummary':
          return dashboardData.stats ? (
            <ProgressSummary 
              completedCourses={dashboardData.stats.completedCourses ?? 0}
              totalCourses={dashboardData.stats.totalCourses ?? 0}
              averageProgress={dashboardData.stats.averageProgress ?? 0}
              isMobile={effectiveIsMobileWeb}
            />
          ) : null;

        default:
          return null;
      }
    })();

    if (!widgetContent) return null;

    return (
      <View style={[
        styles.widgetBase,
        effectiveIsMobileWeb ? styles.widgetMobile : styles.widgetMedium,
        effectiveIsMobileWeb && styles.mobileWidgetBase,
        isVerySmallMobile && styles.verySmallWidgetBase
      ]}>
        <View style={styles.widgetContent}>
          {widgetContent}
        </View>
      </View>
    );
  };

  
  const renderItem = ({ item }: { item: WidgetItem }) => {
    return (
      <View style={[
          styles.widgetContainer,
          { 
            flexBasis: effectiveIsMobileWeb ? '100%' : `${100/columns}%`
          }
        ] as any}>
        {renderWidget(item.widgetConfig)}
      </View>
    );
  };

  const keyExtractor = (item: WidgetItem) => item.id;

  
  const ListHeaderComponent = () => (
    <View style={[
      styles.webContent,
      { padding },
      effectiveIsMobileWeb && styles.mobileWebContent,
      isVerySmallMobile && styles.verySmallWebContent
    ]}>
      <WidgetsGrid 
        showEditButton={!effectiveIsMobileWeb}
        onEditWidgets={() => setShowWidgetsEditor(true)}
        isMobile={effectiveIsMobileWeb}
      >
        {(visibleWidgets) => (
          <View style={[
            styles.widgetsGrid,
            { gap },
            effectiveIsMobileWeb && styles.mobileWidgetsGrid
          ]}>
            {visibleWidgets
              .filter(widget => 
                ['welcome', 'quickActions', 'progress', 'stats'].includes(widget.id)
              )
              .map((widgetConfig) => (
                <View 
                  key={widgetConfig.id} 
                  style={[
                    styles.widgetContainer,
                    { 
                      flexBasis: effectiveIsMobileWeb ? '100%' : `${100/columns}%`
                    }
                  ] as any}
                >
                  {renderWidget(widgetConfig)}
                </View>
              ))
            }
          </View>
        )}
      </WidgetsGrid>
    </View>
  );

  const ListFooterComponent = () => (
    <View style={[
      styles.footerSpace,
      effectiveIsMobileWeb && styles.mobileFooterSpace
    ]} />
  );

  
  if (isEmpty && !refreshing) {
    return (
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <View style={[
            styles.emptyContainer,
            effectiveIsMobileWeb && styles.mobileEmptyContainer
          ]}>
            <View style={[
              styles.emptyState,
              effectiveIsMobileWeb && styles.mobileEmptyState
            ]}>
              <Text style={[
                styles.emptyTitle,
                effectiveIsMobileWeb && styles.mobileEmptyTitle
              ]}>
                ¡Bienvenido a tu Dashboard!
              </Text>
              <Text style={[
                styles.emptyMessage,
                effectiveIsMobileWeb && styles.mobileEmptyMessage
              ]}>
                Aún no tienes cursos asignados. Comienza tu journey de aprendizaje explorando nuestro catálogo de cursos disponibles.
              </Text>
              <TouchableOpacity 
                onPress={handleExploreCatalog}
                style={[
                  styles.exploreButton,
                  effectiveIsMobileWeb && styles.mobileExploreButton
                ]}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.exploreButtonText,
                  effectiveIsMobileWeb && styles.mobileExploreButtonText,
                  { color: theme.colors.card }
                ]}>
                  Explorar Cursos Disponibles
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
        style={[
          styles.container,
          effectiveIsMobileWeb && styles.mobileContainer
        ]}
      />
    );
  }

  return (
    <>
      <FlatList
        key={flatListKey}
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
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
        showsVerticalScrollIndicator={!effectiveIsMobileWeb}
        style={[
          styles.container,
          effectiveIsMobileWeb && styles.mobileContainer
        ]}
        numColumns={effectiveIsMobileWeb ? 1 : columns}
        columnWrapperStyle={effectiveIsMobileWeb ? undefined : { 
          flex: 1, 
          justifyContent: 'space-between',
          marginBottom: gap 
        }}
      />

      <WidgetsEditor
        isVisible={showWidgetsEditor}
        onClose={() => setShowWidgetsEditor(false)}
        isMobile={effectiveIsMobileWeb}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    minHeight: 400,
  },
  mobileContainer: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
    padding: 24,
  },
  mobileEmptyContainer: {
    padding: 16,
    minHeight: 300,
  },
  webContent: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  mobileWebContent: {
    maxWidth: '100%',
    padding: 16,
  },
  verySmallWebContent: {
    padding: 12,
  },
  widgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mobileWidgetsGrid: {
    flexDirection: 'column',
  },
  widgetContainer: {
    marginBottom: 24,
  },
  widgetBase: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      }
    })
  },
  mobileWidgetBase: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  verySmallWidgetBase: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  widgetMobile: {
    width: '100%',
    minHeight: 120,
  },
  widgetMedium: {
    minHeight: 200,
  },
  widgetContent: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mobileSectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  mobileSectionTitle: {
    fontSize: 18,
  },
  verySmallSectionTitle: {
    fontSize: 16,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tabControls: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  viewControls: {
    backgroundColor: '#e6fffa',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#81e6d9',
  },
  viewModeText: {
    fontSize: 11,
    color: '#234e52',
    fontWeight: '600',
  },
  seeAllText: {
    color: '#2b6cb0',
    fontWeight: '500',
    fontSize: 14,
  },
  mobileSeeAllText: {
    fontSize: 13,
  },
  footerSpace: {
    height: 40,
  },
  mobileFooterSpace: {
    height: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
      }
    }),
    width: '100%',
    maxWidth: 500,
  },
  mobileEmptyState: {
    padding: 24,
    maxWidth: '100%',
  },
  emptyStateText: {
    color: '#718096',
    fontSize: 14,
    textAlign: 'center',
  },
  mobileEmptyStateText: {
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  mobileEmptyTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  mobileEmptyMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  mobileExploreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 44,
  },
  exploreButtonText: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  mobileExploreButtonText: {
    fontSize: 14,
  },
});

export default WebDashboardLayout;