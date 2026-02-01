import React, { useEffect } from 'react';
import useAdminGuard from '../../hooks/useAdminGuard';
import { useIsFocused } from '@react-navigation/native';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AllCoursesScreen from '../main/AllCoursesScreen';
import { useNavigation } from '@react-navigation/native';

const AdminCoursesList: React.FC = () => {
  const { theme, colors } = useTheme();
  const navigation = useNavigation<any>();
  useAdminGuard();

  return <AllCoursesScreen adminMode={true} />;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  createButton: { padding: 10, borderRadius: 8 },
  item: { padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontWeight: '700', marginBottom: 4 },
  action: { marginLeft: 12 }
});

export default AdminCoursesList;