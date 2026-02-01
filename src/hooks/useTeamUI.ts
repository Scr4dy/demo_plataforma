
import { useState } from 'react';
import { Alert } from 'react-native';
import { TeamMember, PendingAction } from '../types/team.types';

export const useTeamUI = (navigation: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEvaluateMember = (member: TeamMember) => {
    Alert.alert(
      `Evaluar a ${member.name}`,
      `¿Iniciar evaluación para ${member.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Evaluar', onPress: () => navigation.navigate('Evaluation', { member }) }
      ]
    );
  };

  const handleViewProfile = (member: TeamMember) => {
    Alert.alert(
      `Perfil de ${member.name}`,
      `Ver perfil completo de ${member.name}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver Perfil', onPress: () => navigation.navigate('Profile', { member }) }
      ]
    );
  };

  const handleQuickAction = (action: PendingAction) => {
    Alert.alert(
      'Acción Rápida',
      `¿Procesar "${action.description}"?`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return {
    isModalOpen,
    setIsModalOpen,
    handleEvaluateMember,
    handleViewProfile,
    handleQuickAction
  };
};