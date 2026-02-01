
export const useTeamHelpers = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#38a169';
      case 'inactive': return '#e53e3e';
      case 'pending': return '#d69e2e';
      case 'completed': return '#38a169';
      case 'expired': return '#e53e3e';
      case 'in-progress': return '#2b6cb0';
      default: return '#718096';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#e53e3e';
      case 'medium': return '#d69e2e';
      case 'low': return '#2b6cb0';
      default: return '#718096';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent': return 'warning';
      case 'warning': return 'notifications';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'evaluation': return 'clipboard';
      case 'certification': return 'document-text';
      case 'training': return 'school';
      case 'documentation': return 'folder';
      default: return 'document';
    }
  };

  return {
    getStatusColor,
    getPriorityColor,
    getAlertIcon,
    getActionIcon
  };
};