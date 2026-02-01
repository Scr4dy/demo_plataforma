
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Resource } from '../../types/course.types';
import {
  getResourceTypeIcon,
  getResourceTypeLabel,
  getResourceTypeColor,
} from '../../utils/typeHelpers';
import { useTheme } from '../../context/ThemeContext';

interface ResourceCardMobileProps {
  resource: Resource;
  onResourceDownload?: (resource?: Resource) => void;
  getResourceIcon?: (type?: string) => string;
}

export const ResourceCardMobile: React.FC<ResourceCardMobileProps> = ({
  resource,
  onResourceDownload,
  getResourceIcon
}) => {
  const { colors } = useTheme();

  const getTypeColorFromTheme = (type: string) => {
    const map: Record<string, string> = {
      pdf: colors.error || '#e53e3e',
      video: colors.primary || '#805ad5',
      doc: colors.primary || '#3182ce',
      ppt: colors.warning || '#f56565',
      xls: colors.success || '#38a169',
      zip: colors.warning || '#718096',
      image: colors.accent || '#d69e2e',
    };
    return map[type.toLowerCase()] || (colors.primary || '#718096');
  };

  const handlePress = () => {
    Alert.alert(
      resource.title,
      `Tamaño: ${resource.size}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Descargar', 
          onPress: () => onResourceDownload?.(resource)
        }
      ] as any
    );
  };

  return (
    <TouchableOpacity 
      style={styles.resourceCard}
      onPress={handlePress}
    >

      <View style={styles.resourceHeader}>
        <View style={styles.resourceInfo}>
          <View style={[styles.resourceIcon, { backgroundColor: `${getResourceTypeColor(resource.type ?? '') ?? '#cbd5e1'}15` }]}>
            <Ionicons 
              name={(getResourceIcon?.(resource.type) ?? 'insert-drive-file') as any} 
              size={24} 
              color={getResourceTypeColor(resource.type ?? '') ?? '#2b6cb0'} 
            />
          </View>
          <View style={styles.resourceText}>
            <Text style={styles.resourceTitle} numberOfLines={2}>
              {resource.title}
            </Text>
            <View style={styles.resourceMeta}>
              <View style={[styles.typeBadgeIcon, { backgroundColor: `${getTypeColorFromTheme(resource.type ?? '')}15` }]}>
                <Ionicons name={(getResourceIcon?.(resource.type ?? '') ?? 'insert-drive-file') as any} size={14} color={getTypeColorFromTheme(resource.type ?? '')} />
              </View>
              <Text style={styles.sizeText}>• {resource.size}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => onResourceDownload?.(resource)}
        >
          <Ionicons name="download" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.downloadInfo}>
        <Text style={styles.downloadHint}>
          Toca para ver detalles o el ícono para descargar
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  resourceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resourceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceText: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 6,
    lineHeight: 20,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sizeText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  downloadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    marginLeft: 8,
  },
  downloadInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f7fafc',
    paddingTop: 8,
  },
  downloadHint: {
    fontSize: 11,
    color: '#a0aec0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export const ResourceCardMobileSimple: React.FC<ResourceCardMobileProps> = ({
  resource,
  onResourceDownload,
  getResourceIcon
}) => {
  return (
    <TouchableOpacity 
      style={stylesSimple.resourceCard}
      onPress={() => onResourceDownload?.(resource)}
    >
      <View style={stylesSimple.resourceContent}>
        <View style={[stylesSimple.resourceIcon, { backgroundColor: `${getResourceTypeColor(resource.type ?? '') ?? '#cbd5e1'}15` }]}>
          <Ionicons 
            name={(getResourceIcon?.(resource.type ?? '') ?? 'insert-drive-file') as any} 
            size={20} 
            color={getResourceTypeColor(resource.type ?? '') ?? '#2b6cb0'} 
          />
        </View>
        <View style={stylesSimple.resourceInfo}>
          <Text style={stylesSimple.resourceTitle} numberOfLines={2}>
            {resource.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={(getResourceIcon?.(resource.type ?? '') ?? 'insert-drive-file') as any} size={14} color={getResourceTypeColor(resource.type ?? '') ?? '#2b6cb0'} />
            <Text style={stylesSimple.resourceMeta}>{resource.size}</Text>
          </View>
        </View>
        <Ionicons name="download" size={20} color="#2b6cb0" />
      </View>
    </TouchableOpacity>
  );
};

const stylesSimple = StyleSheet.create({
  resourceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  resourceMeta: {
    fontSize: 12,
    color: '#718096',
  },
});

export const ResourceListItemMobile: React.FC<ResourceCardMobileProps> = ({
  resource,
  onResourceDownload,
  getResourceIcon
}) => {
  return (
    <View style={stylesList.resourceItem}>
      <View style={stylesList.resourceMain}>
        <View style={[stylesList.resourceIcon, { backgroundColor: `${getResourceTypeColor(resource.type ?? '') ?? '#cbd5e1'}15` }]}>
          <Ionicons 
            name={(getResourceIcon?.(resource.type ?? '') ?? 'insert-drive-file') as any} 
            size={18} 
            color={getResourceTypeColor(resource.type ?? '') ?? '#2b6cb0'} 
          />
        </View>
        <View style={stylesList.resourceDetails}>
          <Text style={stylesList.resourceTitle} numberOfLines={1}>
            {resource.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={(getResourceIcon?.(resource.type ?? '') ?? 'insert-drive-file') as any} size={12} color={getResourceTypeColor(resource.type ?? '') ?? '#2b6cb0'} />
            <Text style={stylesList.resourceType}>{resource.size}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={stylesList.downloadButton}
        onPress={() => onResourceDownload?.(resource)}
      >
        <Ionicons name="download" size={18} color="#2b6cb0" />
      </TouchableOpacity>
    </View>
  );
};

const stylesList = StyleSheet.create({
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  resourceMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceDetails: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 2,
  },
  resourceType: {
    fontSize: 12,
    color: '#718096',
  },
  downloadButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f7fafc',
  },
});