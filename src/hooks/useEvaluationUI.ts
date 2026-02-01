
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { SelectedCriteria } from '../types/evaluation.types';
import { getStatusColor as getStatusColorUtil } from '../utils/statusHelpers';

export const useEvaluationUI = () => {
  const getStatusColor = useCallback((status: string): string => {
    return getStatusColorUtil(status);
  }, []);

  const getRadioStyle = useCallback((criteriaId: string, value: string, selectedCriteria: SelectedCriteria) => {
    const isSelected = selectedCriteria[criteriaId] === value;
    const baseStyles = [
      { backgroundColor: '#f7fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
      isSelected && { backgroundColor: '#2b6cb0', borderColor: '#2b6cb0' },
      Platform.OS === 'web' && { minWidth: 80, alignItems: 'center' }
    ];
    return baseStyles;
  }, []);

  const getRadioTextStyle = useCallback((criteriaId: string, value: string, selectedCriteria: SelectedCriteria) => {
    const isSelected = selectedCriteria[criteriaId] === value;
    return [
      { fontSize: 12, color: '#4a5568', fontWeight: '500' },
      isSelected && { color: 'white' }
    ];
  }, []);

  return {
    getStatusColor,
    getRadioStyle,
    getRadioTextStyle
  };
};