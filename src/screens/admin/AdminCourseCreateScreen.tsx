import React, { useEffect } from 'react';
import useAdminGuard from '../../hooks/useAdminGuard';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InlineHeader from '../../components/common/InlineHeader';
import AdminCourseForm from './AdminCourseForm';
import { useAdminCourses } from '../../hooks/useAdminCourses';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const AdminCourseCreateScreen: React.FC = () => {
  const { createCourse } = useAdminCourses();
  const navigation = useNavigation<any>();

  useAdminGuard();

  const { theme } = useTheme();

  const onSave = async (payload: any) => {
    const created = await createCourse(payload);
    navigation.navigate('AdminCourses', { adminMode: true });
    return created;
  };

  return (
    <View style={{ flex: 1 }}>
      <InlineHeader title="Crear Curso" forceBackOnMobile={true} backTo="AdminCourses" containerStyle={{ backgroundColor: theme.colors.primary, borderBottomColor: theme.colors.primary, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} titleStyle={{ fontSize: 15, color: '#fff' }} />
      <AdminCourseForm onSave={onSave} />
    </View>
  );
};

export default AdminCourseCreateScreen;