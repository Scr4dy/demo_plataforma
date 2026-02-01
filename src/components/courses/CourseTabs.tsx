
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CourseTabsProps {
  activeTab: 'modules' | 'resources' | 'details';
  onTabChange: (tab: 'modules' | 'resources' | 'details') => void;
  modulesCount: number;
  resourcesCount: number;
  showBadges?: boolean;
}

export const CourseTabs: React.FC<CourseTabsProps> = ({
  activeTab,
  onTabChange,
  modulesCount,
  resourcesCount
}) => {
  const tabs = [
    { key: 'modules' as const, label: 'Módulos', count: modulesCount },
    { key: 'resources' as const, label: 'Recursos', count: resourcesCount },
    { key: 'details' as const, label: 'Información' }
  ];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map(tab => (
        <TouchableOpacity 
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'white',
    paddingHorizontal: 24,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2b6cb0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#718096',
  },
  activeTabText: {
    color: '#2b6cb0',
  },
});