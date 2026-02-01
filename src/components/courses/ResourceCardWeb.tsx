
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Resource } from '../../types/course.types';

const { width } = Dimensions.get('window');

interface ResourceCardWebProps {
  resource: Resource;
  onResourceDownload?: (resource?: Resource) => void;
  getResourceIcon?: (type?: string) => string;
  showDownloadProgress?: boolean;
}

export const ResourceCardWeb: React.FC<ResourceCardWebProps> = ({
  resource,
  onResourceDownload,
  getResourceIcon
}) => {
  return (
    <View style={styles.resourceCardWeb}>
      <View style={styles.resourceIconWeb}>
        <Ionicons 
          name={(getResourceIcon?.(resource.type) ?? 'insert-drive-file') as any} 
          size={24} 
          color="#2b6cb0" 
        />
      </View>
      <View style={styles.resourceInfoWeb}>
        <Text style={styles.resourceTitleWeb}>{resource.title}</Text>
        <Text style={styles.resourceMetaWeb}>
          {resource.type?.toUpperCase() ?? ''} • {resource.size}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.downloadButtonWeb}
        onPress={() => onResourceDownload?.(resource)}
      >
        <Ionicons name="download" size={18} color="#2b6cb0" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  resourceCardWeb: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: (width - 80) / 2,
    minWidth: 300,
  },
  resourceIconWeb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ebf4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceInfoWeb: {
    flex: 1,
  },
  resourceTitleWeb: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  resourceMetaWeb: {
    fontSize: 12,
    color: '#718096',
  },
  downloadButtonWeb: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f7fafc',
  },
});