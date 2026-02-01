import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DownloadAllResourcesProps {
  resourceCount: number;
  onDownloadAll: () => void;
}

export const DownloadAllResources: React.FC<DownloadAllResourcesProps> = ({
  resourceCount,
  onDownloadAll
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onDownloadAll}>
      <MaterialIcons name="download" size={16} color="#2b6cb0" />
      <Text style={styles.text}>Descargar todos ({resourceCount})</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ebf8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2b6cb0',
  },
});

export default DownloadAllResources;