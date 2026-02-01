
import { useState, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { EvaluationData, SelectedCriteria } from '../types/evaluation.types';

export const useEvaluation = () => {
  const [observations, setObservations] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriteria>({
    '3': '',
    '4': ''
  });
  
  const { width: windowWidth } = useWindowDimensions();
  
  
  const isSmallMobile = windowWidth < 375;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  
  const getResponsiveOptions = () => {
    if (isSmallMobile) {
      return ['Sí', 'Parcial', 'No'];
    }
    return ['Cumplido', 'Parcial', 'No Cumplido'];
  };

  
  const getShortOption = (option: string): string => {
    const shortMap: { [key: string]: string } = {
      'Cumplido': 'Sí',
      'Cumplido Totalmente': 'Sí',
      'Parcial': 'Parcial', 
      'Cumplido Parcialmente': 'Parcial',
      'No Cumplido': 'No',
      'No': 'No'
    };
    return shortMap[option] || option;
  };

  
  const getResponsiveCriteriaTitle = (title: string): string => {
    if (isSmallMobile) {
      const titleMap: { [key: string]: string } = {
        "Inspección Pre-Operativa": "Pre-Operativa",
        "Uso Correcto de Controles": "Controles",
        "Maniobra en Espacio Reducido": "Maniobras",
        "Señalización y Comunicación": "Señalización"
      };
      return titleMap[title] || title.split(' ').slice(0, 2).join(' ');
    }
    if (isMobile && title.length > 25) {
      return title.substring(0, 25) + '...';
    }
    return title;
  };

  
  const getResponsiveName = (name: string): string => {
    if (isSmallMobile) {
      const parts = name.split(' ');
      return parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0)}.` : name;
    }
    return name;
  };

  const evaluationData: EvaluationData = useMemo(() => {
    const options = getResponsiveOptions();
    
    return {
      evaluated: {
        name: getResponsiveName("María Lopez"),
        test: isSmallMobile ? "Montacargas" : 
              isMobile ? "Prueba Montacargas" : "Prueba de Montacargas Segura",
        date: "05/10/2024",
        evaluator: getResponsiveName("Juan Pérez")
      },
      criteria: [
        {
          id: '1',
          title: getResponsiveCriteriaTitle("Inspección Pre-Operativa"),
          icon: "checkmark-circle",
          status: "completed"
        },
        {
          id: '2',
          title: getResponsiveCriteriaTitle("Uso Correcto de Controles"),
          icon: "checkmark-circle",
          status: "completed"
        },
        {
          id: '3',
          title: getResponsiveCriteriaTitle("Maniobra en Espacio Reducido"),
          icon: "construct",
          status: "pending",
          options: options
        },
        {
          id: '4',
          title: getResponsiveCriteriaTitle("Señalización y Comunicación"),
          icon: "megaphone",
          status: "pending",
          options: options
        }
      ],
      observationTips: isSmallMobile 
        ? ["Buen manejo", "Curvas", "Comunicación"]
        : isMobile 
        ? ["Buen manejo", "Practicar curvas", "Buena comunicación"]
        : [
            "Excelente manejo general del equipo",
            "Necesita práctica adicional en curvas cerradas", 
            "Buena comunicación con el equipo de trabajo"
          ],
      status: "in-progress"
    };
  }, [isMobile, isSmallMobile]);

  
  const handleCriteriaSelect = (criteriaId: string, value: string) => {
    setSelectedCriteria(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  
  const getShortOptions = (options: string[]): string[] => {
    return options.map(option => getShortOption(option));
  };

  
  const getProgressStatus = () => {
    const totalCompleted = Object.values(selectedCriteria).filter(value => value !== '').length;
    if (totalCompleted === 2) return 'completed';
    if (totalCompleted > 0) return 'in-progress';
    return 'not-started';
  };

  
  const getProgressInfo = () => {
    const total = 2; 
    const completed = Object.values(selectedCriteria).filter(v => v !== '').length;
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  };

  
  const resetEvaluation = () => {
    setObservations('');
    setSelectedCriteria({
      '3': '',
      '4': ''
    });
  };

  const loading = false;

  return {
    evaluationData,
    observations,
    selectedCriteria,
    loading,
    setObservations,
    setSelectedCriteria,
    handleCriteriaSelect,
    getProgressStatus,
    getProgressInfo,
    resetEvaluation,
    getShortOption,
    getShortOptions,
    isMobile,
    isTablet,
    isSmallMobile,
    isDesktop,
  };
};