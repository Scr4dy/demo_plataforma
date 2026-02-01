import React from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';

interface SafeScrollViewProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  refreshControl?: any;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  onScroll?: any;
  scrollEventThrottle?: number;
}

export const SafeScrollView: React.FC<SafeScrollViewProps> = React.memo(({
  children,
  style,
  contentContainerStyle,
  refreshControl,
  showsVerticalScrollIndicator = true, 
  showsHorizontalScrollIndicator = false,
  onScroll,
  scrollEventThrottle = 16
}) => {
  return (
    <ScrollView
      style={[
        styles.container, 
        Platform.OS === 'web' && styles.webContainer, 
        style
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        Platform.OS === 'web' && styles.webContentContainer, 
        contentContainerStyle
      ]}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      
      {...(Platform.OS === 'web' && {
        alwaysBounceVertical: false,
        overScrollMode: 'never',
      })}
    >
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    
    overflow: 'scroll' as const,
  } as any,
  contentContainer: {
    flexGrow: 1,
  },
  webContentContainer: {
    
    minHeight: '100%',
  } as any,
});

export default SafeScrollView;