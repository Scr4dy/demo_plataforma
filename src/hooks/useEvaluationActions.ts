
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';

export const useEvaluationActions = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleFinalize = useCallback((observations: string) => {
    if (!observations.trim()) {
      Alert.alert(
        'Observaciones requeridas',
        'Por favor ingresa tus observaciones antes de finalizar.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    Alert.alert(
      'Evaluación Finalizada',
      'La evaluación ha sido guardada exitosamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aceptar', 
          onPress: () => {
            
            if (navigation && typeof navigation.navigate === 'function') {
              
              try {
                navigation.navigate('Dashboard');
              } catch (error) {
                
                
                navigation.navigate('Courses');
              }
            }
          }
        }
      ]
    );
  }, [navigation]);

  const handleSave = useCallback(() => {
    Alert.alert('Guardado', 'Evaluación guardada como borrador.');
  }, []);

  const handlePrint = useCallback(() => {
    Alert.alert('Imprimir', 'Preparando para imprimir...');
  }, []);

  const handleRadioSelect = useCallback((
    setSelectedCriteria: any, 
    criteriaId: string, 
    value: string
  ) => {
    setSelectedCriteria((prev: any) => ({
      ...prev,
      [criteriaId]: value
    }));
  }, []);

  return {
    handleFinalize,
    handleSave,
    handlePrint,
    handleRadioSelect
  };
};