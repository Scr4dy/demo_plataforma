

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface UnderConstructionScreenProps {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const getValidIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
  const validIcons: (keyof typeof Ionicons.glyphMap)[] = [
    'construct', 'key', 'notifications', 'language', 'help-circle',
    'school', 'book', 'bar-chart', 'list', 'person-add', 'person'
  ];
  return validIcons.includes(iconName as any) ? iconName as any : 'construct';
};

export const UnderConstructionScreen: React.FC<UnderConstructionScreenProps> = ({
  title,
  description,
  icon = 'construct',
}) => {
  const validIconName = getValidIconName(icon);

  return (
    <SafeAreaView edges={['top','left','right','bottom']} style={styles.container}>
      <View style={styles.content}>
        <Ionicons name={validIconName} size={80} color="#2196F3" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.badge}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.badgeText}>Próximamente</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});
