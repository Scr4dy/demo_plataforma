import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InlineHeader from '../../components/common/InlineHeader';
import AdminCourseForm from './AdminCourseForm';
import { useAdminCourses } from '../../hooks/useAdminCourses';
import { useRoute, useNavigation } from '@react-navigation/native';
import { courseService } from '../../services/courseService';
import useAdminGuard from '../../hooks/useAdminGuard';
import { useTheme } from '../../context/ThemeContext';

const AdminCourseEditScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params || {};
  const { updateCourse } = useAdminCourses();
  
  useAdminGuard();
  const { theme } = useTheme();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const c = await courseService.getCourseById(Number(id));
        setInitialData(c);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudo cargar el curso');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSave = async (payload: any) => {
    await updateCourse(Number(id), payload);
    navigation.navigate('AdminCourses', { adminMode: true });
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <InlineHeader title="Editar Curso" forceBackOnMobile={true} backTo="AdminCourses" containerStyle={{ backgroundColor: theme.colors.primary, borderBottomColor: theme.colors.primary, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} titleStyle={{ fontSize: 15, color: '#fff' }} />
      <AdminCourseForm initialData={initialData} onSave={onSave} />
    </View>
  );
};

export default AdminCourseEditScreen;