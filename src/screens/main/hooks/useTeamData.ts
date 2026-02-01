import { useMemo } from 'react';
import { useTeam } from '../../../hooks/useTeam';

export const useTeamData = ({ authState, navigation, selectedDepartment }: any) => {
  const {
    teamData,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredMembers,
    onRefresh,
    loading
  } = useTeam();

  const isAdmin = authState?.user?.role?.toLowerCase?.().includes('admin');
  const authorized = isAdmin || true; 

  const departments: string[] = useMemo(() => {
    const list = (teamData?.members || []).map((m: any) => m.departamento).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [teamData]);

  return {
    loading,
    authorized,
    teamData,
    departments,
    isAdmin,
    refreshData: onRefresh,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredMembers
  };
};
