import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  useWindowDimensions,
  Platform
} from 'react-native';

interface DashboardHeaderProps {
  searchResultsCount?: number;
  hasActiveFilters?: boolean;
  isTablet?: boolean;
  onStartTour?: () => void;
  viewControls?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchResultsCount,
  hasActiveFilters = false,
  isTablet = false
}) => {
  const { width, height } = useWindowDimensions();
  
  const isWeb = Platform.OS === 'web';
  const isMobileWeb = isWeb && width < 768;
  const isSmallScreen = width < 375;
  const isVerySmallScreen = width < 320;

  
  const getSubtitle = () => {
    if (hasActiveFilters && searchResultsCount !== undefined) {
      return `${searchResultsCount} resultado${searchResultsCount !== 1 ? 's' : ''} encontrado${searchResultsCount !== 1 ? 's' : ''}`;
    }
    if (hasActiveFilters) {
      return 'Resultados filtrados';
    }
    if (searchResultsCount !== undefined && searchResultsCount > 0) {
      return `${searchResultsCount} elemento${searchResultsCount !== 1 ? 's' : ''} en total`;
    }
    return 'Resumen de tu progreso';
  };

  
  const getTitleSize = () => {
    if (isVerySmallScreen) return 20;
    if (isSmallScreen) return 22;
    if (isMobileWeb) return 24;
    if (isTablet) return 26;
    return 28;
  };

  
  const getSubtitleSize = () => {
    if (isVerySmallScreen) return 12;
    if (isSmallScreen) return 13;
    if (isMobileWeb) return 14;
    return 16;
  };

  return (
    <View style={[
      styles.container, 
      isWeb && styles.webContainer,
      isMobileWeb && styles.mobileWebContainer,
      isVerySmallScreen && styles.verySmallContainer
    ]}>
      <View style={[
        styles.header,
        isWeb && styles.webHeader,
        isMobileWeb && styles.mobileWebHeader,
        isTablet && styles.tabletHeader,
        isVerySmallScreen && styles.verySmallHeader
      ]}>
        {}
        <View style={[
          styles.titleSection,
          isMobileWeb && styles.mobileWebTitleSection,
          isVerySmallScreen && styles.verySmallTitleSection
        ]}>
          <Text 
            style={[
              styles.title, 
              { 
                fontSize: getTitleSize()
              },
              isVerySmallScreen && styles.verySmallTitle,
              
              Platform.OS === 'web' ? ({ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as any) : {}
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
          >
            Mi Dashboard
          </Text>
          <Text 
            style={[
              styles.subtitle, 
              { 
                fontSize: getSubtitleSize()
              },
              isVerySmallScreen && styles.verySmallSubtitle
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.7}
          >
            {getSubtitle()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    maxHeight: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  webContainer: {
    paddingTop: 0,
    maxHeight: 110,
  },
  mobileWebContainer: {
    maxHeight: 100,
  },
  verySmallContainer: {
    maxHeight: 90,
    paddingBottom: 4,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 24 : 10,
    paddingBottom: Platform.OS === 'web' ? 16 : 6,
    minHeight: Platform.OS === 'web' ? 80 : 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  webHeader: {
    paddingTop: 16,
    paddingBottom: 12,
    minHeight: 70,
  },
  mobileWebHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    minHeight: 60,
  },
  tabletHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 14,
  },
  verySmallHeader: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 50,
  },
  titleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  mobileWebTitleSection: {
    marginRight: 12,
  },
  verySmallTitleSection: {
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 32,
    color: '#333333',
  },
  verySmallTitle: {
    lineHeight: 24,
    marginBottom: 2,
  },
  subtitle: {
    lineHeight: 20,
    flexShrink: 1,
    color: '#666666',
  },
  verySmallSubtitle: {
    lineHeight: 16,
  }
});

export default DashboardHeader;