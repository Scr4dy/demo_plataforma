import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import useAdminGuard from '../../hooks/useAdminGuard';
import InlineHeader from '../../components/common/InlineHeader';
import { useHeader } from '../../context/HeaderContext';
import { supabase } from '../../config/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { platformShadow } from '../../utils/styleHelpers';

const AdminDashboardScreen: React.FC = () => {
  const { theme, colors, themeType, setThemeType } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  
  const cycleTheme = async () => {
    const next = themeType === 'light' ? 'dark' : themeType === 'dark' ? 'auto' : 'light';
    await setThemeType(next as any);
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const hexClean = hex.replace('#', '');
    const bigint = parseInt(hexClean.length === 3 ? hexClean.split('').map(c => c + c).join('') : hexClean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useAdminGuard();

  const { setHeader } = useHeader(); 

  useEffect(() => {
    
    if (Platform.OS === 'web') {
      setHeader({ hidden: true, owner: 'AdminDashboard', manual: true });
    } else {
      setHeader({
        title: 'Administración',
        subtitle: 'Panel de control y gestión del sistema',
        owner: 'AdminDashboard',
        showBack: false,
        manual: true
      });
    }

    return () => {
      try { setHeader(null); } catch (_) { }
    }
  }, [setHeader]);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const goToCourses = () => {
    if ((Platform.OS as any) === 'web') {
      try {
        const { goToWebTab } = require('../../utils/webNav');
        goToWebTab('AdminCourses');
        return;
      } catch (e) {  }
    }
    navigation.navigate('AdminCourses', { adminMode: true });
  };
  const goToUsers = () => {
    if ((Platform.OS as any) === 'web') {
      try {
        const { goToWebTab } = require('../../utils/webNav');
        goToWebTab('AdminUsers');
        return;
      } catch (e) {  }
    }
    navigation.navigate('AdminUsers');
  };
  const goToCategories = () => {
    if ((Platform.OS as any) === 'web') {
      try {
        const { goToWebRoute } = require('../../utils/webNav');
        goToWebRoute('AdminCategories');
        return;
      } catch (e) {  }
    }
    navigation.navigate('AdminCategories');
  };
  const goToReports = () => {
    if ((Platform.OS as any) === 'web') {
      try {
        const { goToWebTab } = require('../../utils/webNav');
        goToWebTab('AdminReports');
        return;
      } catch (e) {  }
    }
    navigation.navigate('AdminReports');
  };

  const adminCards = [
    {
      title: 'Gestionar Cursos',
      description: 'Crear, editar y administrar cursos',
      icon: 'book' as keyof typeof Ionicons.glyphMap,
      color: '#EF4444',
      onPress: goToCourses,
    },
    {
      title: 'Categorías',
      description: 'Gestionar categorías del sistema',
      icon: 'pricetags' as keyof typeof Ionicons.glyphMap,
      color: '#F59E0B',
      onPress: goToCategories,
    },
    {
      title: 'Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      color: '#10B981',
      onPress: goToUsers,
    },
    {
      title: 'Reportes',
      description: 'Ver estadísticas y análisis',
      icon: 'stats-chart' as keyof typeof Ionicons.glyphMap,
      color: '#8B5CF6',
      onPress: goToReports,
    }
  ];

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}

        <View style={[styles.grid, (Platform.OS === 'web') ? { gap: 6, justifyContent: 'flex-start' } : {}]}>
          {adminCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              onPress={card.onPress}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  
                  flexBasis: (Platform.OS === 'web') ? (isDesktop ? '23%' : isTablet ? '48%' : '100%') : '100%',
                  padding: (Platform.OS === 'web') ? 12 : 24,
                  minHeight: (Platform.OS === 'web') ? 64 : 150,
                  ...(Platform.OS === 'web' ? { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' } : { justifyContent: 'space-between' }),
                  ...(Platform.OS === 'web' && {
                    boxShadow: theme.dark
                      ? '0 1px 6px rgba(0, 0, 0, 0.18)'
                      : '0 2px 8px rgba(0, 0, 0, 0.06)',
                    minWidth: 110,
                  }),
                }
              ]}
              activeOpacity={0.7}
            >
              <View style={[styles.cardContent, (Platform.OS === 'web') ? { marginBottom: 4, alignItems: 'center', flex: 1, paddingRight: 12 } : {}]}>
                <View style={[styles.iconContainer, (Platform.OS === 'web') ? { width: 56, height: 56, borderRadius: 12, marginRight: 16, padding: 6, justifyContent: 'center', alignItems: 'center' } : { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }, { backgroundColor: theme.dark ? theme.colors.divider : hexToRgba(card.color, 0.12) }]}>
                  <Ionicons name={card.icon} size={(Platform.OS === 'web') ? 20 : 36} color={card.color} style={(Platform.OS === 'web' && card.icon === 'stats-chart') ? { marginTop: 1 } : undefined} />
                </View>
                <View style={[styles.cardTextContainer, (Platform.OS === 'web') ? { paddingVertical: 2 } : { marginTop: 4 }]}>
                  <Text style={[styles.cardText, { color: theme.colors.text, fontSize: (Platform.OS === 'web') ? 13 : 19, fontWeight: '700' }]}>{card.title}</Text>
                  <Text style={[styles.cardDescription, { color: theme.colors.textSecondary, fontSize: (Platform.OS === 'web') ? 13 : 14 }]} numberOfLines={2}>
                    {card.description}
                  </Text>
                </View>
              </View>
              <View style={[styles.arrowContainer, (Platform.OS === 'web') ? { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' } : { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }, { backgroundColor: theme.dark ? theme.colors.divider : hexToRgba(card.color, 0.12) }]}>
                <Ionicons name="arrow-forward" size={(Platform.OS === 'web') ? 18 : 22} color={card.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },

  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  
  statsGridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  
  statCardMobile: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    minHeight: 100,
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  
  grid: {
    gap: 12,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    minHeight: 140,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});

export default AdminDashboardScreen;