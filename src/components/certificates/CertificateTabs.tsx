import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CertificateTabsProps {
  activeTab: 'active' | 'inProgress' | 'expired';
  onTabChange: (tab: 'active' | 'inProgress' | 'expired') => void;
  counts: {
    active: number;
    inProgress: number;
    expired: number;
  };
}

type TabType = {
  key: 'active' | 'inProgress' | 'expired';
  icon: 'checkmark-circle' | 'time' | 'warning';
  label: string;
  count: number;
};

export const CertificateTabs: React.FC<CertificateTabsProps> = ({
  activeTab,
  onTabChange,
  counts
}) => {
  const tabs: TabType[] = [
    { key: 'active', icon: 'checkmark-circle', label: 'Vigentes', count: counts.active },
    { key: 'inProgress', icon: 'time', label: 'En Progreso', count: counts.inProgress },
    { key: 'expired', icon: 'warning', label: 'Expirados', count: counts.expired }
  ];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map(tab => (
        <TouchableOpacity 
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => onTabChange(tab.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab.key }}
          accessibilityLabel={`${tab.label}, ${tab.count} certificados`}
        >
          <Ionicons 
            name={tab.icon} 
            size={18} 
            color={activeTab === tab.key ? '#2b6cb0' : '#718096'} 
          />
          <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
            {tab.label} ({tab.count})
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 24,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
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
    fontWeight: '600',
  },
});