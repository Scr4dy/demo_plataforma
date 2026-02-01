import { useState } from 'react';

export const useProfileUI = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return {
    isEditModalOpen,
    setIsEditModalOpen,
    activeTab,
    setActiveTab
  };
};